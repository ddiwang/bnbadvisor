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

import multer  from 'multer';
import path from 'path';

// config pic
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/'); // 
  },
  filename: function (req, file, cb) {
    // add dupes
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// only images allowed
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/gif' ||
    file.mimetype === 'image/webp'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// Host management routes (must come before /:id route)
router.get('/manage', getManageProperties);
router.post('/manage', sanitizeInput,upload.array('propertyImage[]'), createPropertyFromForm);
router.get('/manage/:id/edit', getEditProperty);
router.post('/manage/:id/edit', sanitizeInput, upload.array('propertyImage', 10), updatePropertyFromForm);
router.post('/manage/:id/delete', deletePropertyFromForm);

// API routes
router.get('/', getAllProperties);
router.get('/:id', getPropertyById);
router.post('/', sanitizeInput, createProperty);
router.put('/:id', sanitizeInput, updateProperty);
router.delete('/:id', deleteProperty);

export default router;
