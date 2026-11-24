import express from 'express';
import { getTemplates, uploadTemplate, editTemplate, removeTemplate } from '../controllers/templateController.js';

const router = express.Router();

// GET /api/templates and GET /api/admin/templates
router.get('/', getTemplates);
router.get('', getTemplates);

// POST /api/templates and POST /api/admin/templates
router.post('/', uploadTemplate);
router.post('', uploadTemplate);

// PUT /api/templates/:id and PUT /api/admin/templates/:id
router.put('/:id', editTemplate);

// DELETE /api/templates/:id and DELETE /api/admin/templates/:id
router.delete('/:id', removeTemplate);

export default router;
