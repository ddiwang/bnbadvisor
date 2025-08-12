import express from 'express';
import Reviews from '../models/Review.js';
import * as reviewController from '../controllers/reviewController.js';

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


// 评论详情
router.get('/:reviewId', reviewController.show);

// 某用户的评论列表
router.get('/user/:userId', reviewController.userReviews);

// 评论编辑表单
router.get('/:reviewId/edit', reviewController.editForm);

// 评论更新
router.post('/:reviewId', reviewController.update);

// 评论删除
router.post('/:reviewId/delete', reviewController.remove);

// 点赞
router.post('/:reviewId/like', reviewController.like);

// 取消点赞
router.post('/:reviewId/unlike', reviewController.unlike);

export default router;