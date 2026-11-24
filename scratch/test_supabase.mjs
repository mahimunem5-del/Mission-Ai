import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../server/.env') });

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testing Supabase with URL:', url, 'Key length:', key ? key.length : 0);

const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
});

try {
    const { data, error } = await supabase.from('image_templates').select('id').limit(1);
    console.log('Image templates query:', { data, error });
} catch (e) {
    console.log('Exception:', e.message);
}
