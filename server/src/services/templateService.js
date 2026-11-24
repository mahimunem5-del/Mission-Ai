import crypto from 'crypto';
import { getSupabaseClient } from '../db/dbService.js';
import logger from '../utils/logger.js';

const BUCKET_NAME = 'templates';

/**
 * 1. Auto-Ensure Bucket:
 * Ensures the 'templates' public bucket exists in Supabase Storage.
 */
export async function ensureTemplatesBucket() {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { data: bucket, error: getErr } = await supabase.storage.getBucket(BUCKET_NAME);
    if (!bucket || getErr) {
      const { data, error: createErr } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 52428800 // 50MB
      });
      if (createErr && !createErr.message?.toLowerCase().includes('already exists')) {
        logger.warn('Failed to ensure templates bucket in Supabase Storage', { error: createErr.message });
        return false;
      }
    }
    return true;
  } catch (err) {
    logger.warn('Error verifying templates bucket in Supabase Storage', { error: err.message });
    return false;
  }
}

/**
 * 2. Fetch all templates from Supabase Database image_templates table.
 */
export async function getAllTemplates() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('image_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching image_templates from Supabase', { error: error.message });
      return [];
    }
    return data || [];
  } catch (err) {
    logger.error('Exception fetching image_templates from Supabase', { error: err.message });
    return [];
  }
}

/**
 * 3. Upload template cover directly to Supabase Storage and create row in image_templates.
 * Does NOT write any files to local disk.
 */
export async function createTemplate({ title, category, prompt, image, fileBuffer, mimeType, filename }) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase client is not configured.');
  }

  await ensureTemplatesBucket();

  let publicUrl = '';
  let uniqueFilePath = null;

  // Resolve upload buffer and MIME type
  let bufferToUpload = fileBuffer;
  let detectedMime = mimeType || 'image/webp';
  let ext = 'webp';

  if (!bufferToUpload && image && typeof image === 'string') {
    if (image.startsWith('data:')) {
      const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        detectedMime = matches[1];
        bufferToUpload = Buffer.from(matches[2], 'base64');
        if (detectedMime.includes('png')) ext = 'png';
        else if (detectedMime.includes('jpeg') || detectedMime.includes('jpg')) ext = 'jpg';
        else if (detectedMime.includes('webp')) ext = 'webp';
      }
    } else if (image.startsWith('http://') || image.startsWith('https://')) {
      publicUrl = image;
    } else if (image.length > 0) {
      publicUrl = image;
    }
  }

  // Upload buffer directly to Supabase Storage (no local disk writes)
  if (bufferToUpload) {
    const randomHex = crypto.randomBytes(6).toString('hex');
    const safeName = (filename || 'template')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30);
    uniqueFilePath = `covers/${Date.now()}-${randomHex}-${safeName}.${ext}`;

    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(uniqueFilePath, bufferToUpload, {
        contentType: detectedMime,
        upsert: false
      });

    if (uploadErr) {
      logger.error('Failed to upload template image to Supabase Storage', { error: uploadErr.message });
      throw new Error(`Storage upload failed: ${uploadErr.message}`);
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(uniqueFilePath);

    publicUrl = urlData.publicUrl;
  }

  // Insert row into Supabase image_templates table (ensure storage_path is not null)
  const rowData = {
    title: (title || '').trim() || 'Design Template',
    category: (category || '').trim() || 'Portrait & Photo',
    prompt: (prompt || '').trim(),
    image_url: publicUrl,
    storage_path: uniqueFilePath || `url-reference/${Date.now()}`
  };

  const { data: createdRow, error: insertErr } = await supabase
    .from('image_templates')
    .insert(rowData)
    .select()
    .single();

  if (insertErr) {
    // If database insertion fails, roll back the uploaded storage object
    if (uniqueFilePath) {
      try {
        await supabase.storage.from(BUCKET_NAME).remove([uniqueFilePath]);
      } catch (_) {}
    }
    logger.error('Failed to insert template into image_templates', { error: insertErr.message });
    throw new Error(`Database insert failed: ${insertErr.message}`);
  }

  return createdRow;
}

/**
 * 4. Update an existing template in Supabase Database and Storage.
 */
export async function updateTemplate(id, { title, category, prompt, image, fileBuffer, mimeType, filename }) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase client is not configured.');
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!id || !uuidRegex.test(id)) {
    return createTemplate({ title, category, prompt, image, fileBuffer, mimeType, filename });
  }

  const { data: existing, error: findErr } = await supabase
    .from('image_templates')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (findErr || !existing) {
    return createTemplate({ title, category, prompt, image, fileBuffer, mimeType, filename });
  }

  await ensureTemplatesBucket();

  let publicUrl = existing.image_url;
  let uniqueFilePath = existing.storage_path;

  // Resolve upload buffer and MIME type
  let bufferToUpload = fileBuffer;
  let detectedMime = mimeType || 'image/webp';
  let ext = 'webp';

  if (!bufferToUpload && image && typeof image === 'string') {
    if (image.startsWith('data:')) {
      const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        detectedMime = matches[1];
        bufferToUpload = Buffer.from(matches[2], 'base64');
        if (detectedMime.includes('png')) ext = 'png';
        else if (detectedMime.includes('jpeg') || detectedMime.includes('jpg')) ext = 'jpg';
        else if (detectedMime.includes('webp')) ext = 'webp';
      }
    } else if ((image.startsWith('http://') || image.startsWith('https://')) && image !== existing.image_url) {
      publicUrl = image;
      uniqueFilePath = `url-reference/${Date.now()}`;
    } else if (image && image !== existing.image_url) {
      publicUrl = image;
      uniqueFilePath = `url-reference/${Date.now()}`;
    }
  }

  if (bufferToUpload) {
    const randomHex = crypto.randomBytes(6).toString('hex');
    const safeName = (filename || 'template')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30);
    const newFilePath = `covers/${Date.now()}-${randomHex}-${safeName}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(newFilePath, bufferToUpload, {
        contentType: detectedMime,
        upsert: false
      });

    if (uploadErr) {
      logger.error('Failed to upload new template image to Supabase Storage', { error: uploadErr.message });
      throw new Error(`Storage upload failed: ${uploadErr.message}`);
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(newFilePath);

    // Delete old file if existed and was in covers/
    if (existing.storage_path && existing.storage_path.startsWith('covers/')) {
      try {
        await supabase.storage.from(BUCKET_NAME).remove([existing.storage_path]);
      } catch (_) {}
    }

    uniqueFilePath = newFilePath;
    publicUrl = urlData.publicUrl;
  }

  const updateData = {
    title: (title || '').trim() || existing.title || 'Design Template',
    category: (category || '').trim() || existing.category || 'Portrait & Photo',
    prompt: (prompt || '').trim() || existing.prompt,
    image_url: publicUrl,
    storage_path: uniqueFilePath || `url-reference/${Date.now()}`
  };

  const { data: updatedRow, error: updateErr } = await supabase
    .from('image_templates')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (updateErr) {
    logger.error('Failed to update template in image_templates', { error: updateErr.message });
    throw new Error(`Database update failed: ${updateErr.message}`);
  }

  return updatedRow;
}

/**
 * 5. Delete template from Supabase Storage and image_templates table.
 */
export async function deleteTemplate(id) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase client is not configured.');
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!id || !uuidRegex.test(id)) {
    return { success: true, deleted: true, id };
  }

  // Look up row's storage_path
  const { data: row, error: fetchErr } = await supabase
    .from('image_templates')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (fetchErr) {
    logger.warn('Error finding template prior to deletion', { id, error: fetchErr.message });
  }

  // Remove object from Supabase Storage if storage_path belongs to covers/
  if (row && row.storage_path && row.storage_path.startsWith('covers/')) {
    try {
      const { error: removeErr } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([row.storage_path]);
      if (removeErr) {
        logger.warn('Failed to remove object from Supabase Storage', { path: row.storage_path, error: removeErr.message });
      }
    } catch (storageEx) {
      logger.warn('Exception removing object from Supabase Storage', { error: storageEx.message });
    }
  }

  // Delete row from image_templates
  const { error: deleteErr } = await supabase
    .from('image_templates')
    .delete()
    .eq('id', id);

  if (deleteErr) {
    logger.error('Failed to delete row from image_templates', { id, error: deleteErr.message });
    throw new Error(`Database delete failed: ${deleteErr.message}`);
  }

  return { success: true, deleted: true, id };
}

export default {
  ensureTemplatesBucket,
  getAllTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate
};
