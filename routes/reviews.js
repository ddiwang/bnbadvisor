import { Router } from 'express';
import { sanitizeInput } from '../middleware/xss.js';
import {
    createReview,
    getReviewById,
    getReviewsByProperty,
    updateReview,
    deleteReview,
    likeReview
} from '../controllers/reviewController.js';

const router = Router();

// Create a new review
router.post('/', sanitizeInput, createReview);

// Add review route (same as create, but different path for form submission)
router.post('/add', sanitizeInput, (req, res, next) => {
    console.log('POST /reviews/add route hit');
    console.log('Request body:', req.body);
    console.log('Session user:', req.session.user);
    createReview(req, res, next);
});

// Get review by ID
router.get('/:id', getReviewById);

// Get all reviews for a property
router.get('/property/:propertyId', getReviewsByProperty);

// Update a review
router.put('/:id', sanitizeInput, updateReview);

// Delete a review
router.delete('/:id', deleteReview);

// 点赞接口
// router.post('/:id/like', async (req, res) => {
//   try {
//     const review = await Reviews.findById(req.params.id);
//     if (!review) {
//       return res.status(404).json({ success: false, message: 'Review not found' });
//     }

//     review.likes += 1;
//     await review.save();

//     res.json({ success: true, likes: review.likes });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

//router.post('/reviews/:id/like', likeReview);
router.post('/:id/like', likeReview);




export default router;
