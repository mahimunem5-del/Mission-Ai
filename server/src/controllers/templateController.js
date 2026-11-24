import { getAllTemplates, createTemplate, updateTemplate, deleteTemplate } from '../services/templateService.js';
import logger from '../utils/logger.js';

function formatTemplateRow(r) {
  if (!r) return r;
  const imgUrl = r.image_url || r.imageUrl || r.img || '';
  return {
    id: r.id,
    title: r.title,
    category: r.category,
    prompt: r.prompt,
    image_url: imgUrl,
    imageUrl: imgUrl,
    img: imgUrl,
    storage_path: r.storage_path,
    created_at: r.created_at,
    createdAt: r.created_at,
    aspectRatio: '1:1',
    ratio: '1:1',
    targetWorkflow: (r.category === 'Portrait & Photo' || r.category === 'Avatar & Stylized') ? 'precise-edit' : 'generate'
  };
}

/**
 * Public & Admin Fetch Templates:
 * GET /api/templates and GET /api/admin/templates
 */
export async function getTemplates(req, res, next) {
  try {
    const rawRows = await getAllTemplates();
    const rows = Array.isArray(rawRows) ? rawRows : (Array.isArray(rawRows?.templates) ? rawRows.templates : (Array.isArray(rawRows?.data) ? rawRows.data : []));
    const formatted = rows.map(formatTemplateRow);
    return res.json({
      success: true,
      templates: formatted,
      data: formatted
    });
  } catch (err) {
    logger.error('Failed to get templates in templateController', { error: err.message });
    return next(err);
  }
}

/**
 * Admin Upload / Upsert Template:
 * POST /api/admin/templates
 */
export async function uploadTemplate(req, res, next) {
  try {
    const { id, title, category, prompt, image, dataUrl, imageUrl, imageData } = req.body || {};
    const imgPayload = image || dataUrl || imageUrl || imageData || '';

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed: "prompt" is required.'
      });
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let result;
    if (id && uuidRegex.test(id)) {
      result = await updateTemplate(id, {
        title,
        category,
        prompt,
        image: imgPayload,
        fileBuffer: req.file?.buffer,
        mimeType: req.file?.mimetype,
        filename: req.file?.originalname
      });
    } else {
      result = await createTemplate({
        title,
        category,
        prompt,
        image: imgPayload,
        fileBuffer: req.file?.buffer,
        mimeType: req.file?.mimetype,
        filename: req.file?.originalname
      });
    }

    const formatted = formatTemplateRow(result);
    return res.status(201).json({
      success: true,
      template: formatted,
      data: formatted
    });
  } catch (err) {
    logger.error('Failed to upload template in templateController', { error: err.message });
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to upload template'
    });
  }
}

/**
 * Admin Edit Template:
 * PUT /api/admin/templates/:id
 */
export async function editTemplate(req, res, next) {
  try {
    const { id } = req.params;
    const { title, category, prompt, image, dataUrl, imageUrl, imageData } = req.body || {};
    const imgPayload = image || dataUrl || imageUrl || imageData || '';

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed: "prompt" is required.'
      });
    }

    const updated = await updateTemplate(id, {
      title,
      category,
      prompt,
      image: imgPayload,
      fileBuffer: req.file?.buffer,
      mimeType: req.file?.mimetype,
      filename: req.file?.originalname
    });

    const formatted = formatTemplateRow(updated);
    return res.json({
      success: true,
      template: formatted,
      data: formatted
    });
  } catch (err) {
    logger.error('Failed to edit template in templateController', { error: err.message });
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to edit template'
    });
  }
}

/**
 * Admin Delete Template:
 * DELETE /api/admin/templates/:id
 */
export async function removeTemplate(req, res, next) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Template ID is required.'
      });
    }

    const result = await deleteTemplate(id);
    return res.json({
      success: true,
      deleted: true,
      id: result.id
    });
  } catch (err) {
    logger.error('Failed to delete template in templateController', { error: err.message });
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to delete template'
    });
  }
}

export default {
  getTemplates,
  uploadTemplate,
  editTemplate,
  removeTemplate
};
