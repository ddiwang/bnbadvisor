// routes/propertyRoutes.js
import express from 'express';
import * as propertyController from '../controllers/propertyController.js';

const router = express.Router();

// 详情页
router.get('/:id', propertyController.getPropertyById);

export default router;