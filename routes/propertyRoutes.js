import express from 'express';
import Property from '../models/Property.js';
import Reviews from '../models/Reviews.js';

const router = express.Router();

// 详情页
router.get('/:id', async (req, res) => {
  try {
    // 查找房源
    const property = await Property.findById(req.params.id).lean();
    if (!property) {
      return res.status(404).render('error', {
        title: 'Property Not Found',
        message: 'Sorry, this property does not exist.'
      });
    }

    // 查找该房源的所有评论
    const reviews = await Reviews.find({ listingId: property._id }).lean();

    // 计算平均评分
    let averageRating = 0;
    if (reviews.length > 0) {
      averageRating =
        reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      averageRating = Math.round(averageRating * 10) / 10;
    }

    // 把平均分写回数据库，让首页能直接显示
    await Property.findByIdAndUpdate(property._id, { averageRating });

    res.render('property/detail', {
      bnb: property,
      reviews,
      averageRating
    });
  } catch (err) {
    console.error('Error fetching property detail:', err);
    res.status(500).render('error', {
      title: 'Server Error',
      message: 'Something went wrong loading the property.'
    });
  }
});

export default router;