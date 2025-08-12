import express from 'express';
import Reviews from '../models/Reviews.js';

const router = express.Router();

// 点赞接口
router.post('/:id/like', async (req, res) => {
  try {
    const review = await Reviews.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.likes += 1;
    await review.save();

    res.json({ success: true, likes: review.likes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;