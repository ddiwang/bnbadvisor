import { Router } from 'express';
import Property from '../models/Property.js';
import Review from '../models/Review.js';
import User from '../models/User.js';

const router = Router();

// Get properties with optional owner filter
router.get('/properties', async (req, res) => {
  try {
    const { owner, city } = req.query;
    const filter = {};
    
    if (owner) filter.owner = owner;
    if (city) filter.city = new RegExp(city, 'i');
    
    const properties = await Property.find(filter)
      .populate('owner', 'firstName lastName')
      .sort({ createdAt: -1 });
      
    res.json(properties);
  } catch (error) {
    console.error('API properties error:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// Get reviews by user
router.get('/reviews/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const reviews = await Review.find({ user: userId })
      .populate('property', 'title city')
      .sort({ createdAt: -1 });
    
    const total = reviews.length;
    const avgRating = total > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / total 
      : 0;
    
    res.json({
      reviews,
      total,
      avgRating
    });
  } catch (error) {
    console.error('API user reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch user reviews' });
  }
});

// Get reviews for host's properties
router.get('/reviews/host/:hostId', async (req, res) => {
  try {
    const { hostId } = req.params;
  
    const properties = await Property.find({ owner: hostId });
    const propertyIds = properties.map(p => p._id);
  
    const reviews = await Review.find({ property: { $in: propertyIds } })
      .populate('user', 'firstName lastName')
      .populate('property', 'title city')
      .sort({ createdAt: -1 });
    
    const total = reviews.length;
    const avgRating = total > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / total 
      : 0;
    
    res.json({
      reviews,
      total,
      avgRating
    });
  } catch (error) {
    console.error('API host reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch host reviews' });
  }
});

export default router;