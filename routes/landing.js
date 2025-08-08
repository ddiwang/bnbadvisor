import express from 'express';
import { getLandingPage, getListings } from '../controllers/landingController.js';
import { sanitizeInput } from '../middleware/xss.js';

const router = express.Router();

router.get('/', sanitizeInput, getLandingPage);
router.get('/listings', sanitizeInput, getListings);

export default router;