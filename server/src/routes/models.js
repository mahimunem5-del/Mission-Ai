import express from 'express';
import { getAvailableModelsCatalog } from '../services/modelRouter.js';

const router = express.Router();

// GET /api/models — Single source of truth for verified, available chat models
router.get('/', (req, res) => {
  const models = getAvailableModelsCatalog();
  res.json({
    models,
    count: models.length
  });
});

export default router;
