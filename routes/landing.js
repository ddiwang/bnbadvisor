import express from 'express';
import { getLandingPage, getListings,getId } from '../controllers/landingController.js';
import { sanitizeInput } from '../middleware/xss.js';

const router = express.Router();

router.get('/', sanitizeInput, getLandingPage);
router.get('/listings', sanitizeInput, getListings);
router.get('/properties/:id', sanitizeInput, getId);

export default router;