import express from 'express';
import { getLandingPage, getListings, getPropertyDetails } from '../controllers/landingController.js';
import { sanitizeInput } from '../middleware/xss.js';

const router = express.Router();

router.get('/', sanitizeInput, getLandingPage);
router.get('/listings', sanitizeInput, getListings);
router.get('/property/:id', sanitizeInput, getPropertyDetails);

export default router;