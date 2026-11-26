import express from 'express';
import { listToolDefinitions } from '../ai/tools/toolRegistry.js';

const router = express.Router();

// GET /api/tools — Central Unified Tool Registry catalog
router.get('/', (req, res) => {
  const tools = listToolDefinitions();
  res.json({
    success: true,
    tools,
    count: tools.length
  });
});

export default router;
