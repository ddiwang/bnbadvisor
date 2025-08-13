import { Router } from 'express';
import { 
    getAllProperties, 
    createProperty,
    getPropertyById,
    updateProperty,
    deleteProperty,
    getManageProperties,
    createPropertyFromForm,
    deletePropertyFromForm,
    getEditProperty,
    updatePropertyFromForm
} from '../controllers/propertyController.js';
import { sanitizeInput } from '../middleware/xss.js';

const router = Router();

// Host management routes (must come before /:id route)
router.get('/manage', getManageProperties);
router.post('/manage', sanitizeInput, createPropertyFromForm);
router.get('/manage/:id/edit', getEditProperty);
router.post('/manage/:id/edit', sanitizeInput, updatePropertyFromForm);
router.post('/manage/:id/delete', deletePropertyFromForm);

// API routes
router.get('/', getAllProperties);
router.get('/:id', getPropertyById);
router.post('/', sanitizeInput, createProperty);
router.put('/:id', sanitizeInput, updateProperty);
router.delete('/:id', deleteProperty);

export default router;
