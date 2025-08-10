import Review from '../models/Reviews.js';
import Property from '../models/Property.js';
import mongoose from 'mongoose';

// 获取用户所有评论
export const getUserReviews = async (req, res) => {
  try {
    const userId = req.session.user._id;
    
    const reviews = await Review.aggregate([
      { $match: { guestId: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: 'properties',
          localField: 'listingId',
          foreignField: '_id',
          as: 'property'
        }
      },
      { $unwind: '$property' },
      { $sort: { createdAt: -1 } }
    ]);
    
    res.render('users/reviews', {
      title: 'Your Reviews',
      reviews
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).render('error', {
      title: 'Server Error',
      errorCode: 500,
      errorMessage: 'Failed to load your reviews'
    });
  }
};

// 显示编辑评论表单
export const showEditReviewForm = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const userId = req.session.user._id;
    
    const review = await Review.findOne({
      _id: reviewId,
      guestId: userId
    }).populate('property');
    
    if (!review) {
      return res.status(404).render('error', {
        title: 'Not Found',
        errorCode: 404,
        errorMessage: 'Review not found'
      });
    }
    
    res.render('reviews/edit', {
      title: 'Edit Your Review',
      review
    });
  } catch (error) {
    console.error('Edit review form error:', error);
    res.status(500).render('error', {
      title: 'Server Error',
      errorCode: 500,
      errorMessage: 'Failed to load review form'
    });
  }
};

// 更新评论
export const updateReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const userId = req.session.user._id;
    const { rating, comment } = req.body;
    
    const updatedReview = await Review.findOneAndUpdate(
      { _id: reviewId, guestId: userId },
      { rating, comment },
      { new: true, runValidators: true }
    ).populate('property');
    
    if (!updatedReview) {
      return res.status(404).render('error', {
        title: 'Not Found',
        errorCode: 404,
        errorMessage: 'Review not found'
      });
    }
    
    // 更新房源的平均评分
    await updatePropertyRating(updatedReview.property._id);
    
    req.flash('success', 'Review updated successfully');
    res.redirect('/profile/reviews');
  } catch (error) {
    console.error('Update review error:', error);
    req.flash('error', 'Failed to update review');
    res.redirect(`/reviews/${reviewId}/edit`);
  }
};

// 删除评论
export const deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const userId = req.session.user._id;
    
    const review = await Review.findOneAndDelete({
      _id: reviewId,
      guestId: userId
    });
    
    if (!review) {
      return res.status(404).render('', {
        title: 'Not Found',
        errorCode: 404,
        errorMessage: 'Review not found'
      });
    }
    
    // 更新房源的平均评分
    await updatePropertyRating(review.listingId);
    
    req.flash('success', 'Review deleted successfully');
    res.redirect('/profile/reviews');
  } catch (error) {
    console.error('Delete review error:', error);
    req.flash('error', 'Failed to delete review');
    res.redirect('/profile/reviews');
  }
};

// 辅助函数：更新房源平均评分
const updatePropertyRating = async (propertyId) => {
  const reviews = await Review.find({ listingId: propertyId });
  
  if (reviews.length === 0) {
    await Property.findByIdAndUpdate(propertyId, {
      averageRating: 0,
      reviewCount: 0
    });
    return;
  }
  
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;
  
  await Property.findByIdAndUpdate(propertyId, {
    averageRating: parseFloat(averageRating.toFixed(1)),
    reviewCount: reviews.length
  });
};