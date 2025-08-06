const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');

router.get('/', propertyController.getLandingPage);

router.get('/listings', propertyController.getListingsPage);

export default router;
