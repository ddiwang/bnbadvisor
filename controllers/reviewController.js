import mongoose from 'mongoose';
import xss from 'xss';
import Review from '../models/Review.js';
import User from '../models/user.js';
import Property from '../models/property.js';

// Helper: Check if an ObjectId is valid
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// Unified error rendering function
function renderError(res, errorMsg, status = 400, view = 'error', extraData = {}) {
  res.status(status).render(view, { errorMsg, ...extraData });
}

// Create new review
export async function create(req, res, next) {
  try {
    const { listingId } = req.params.listingId;
    const userId = req.user && req.user._id;
    const { comment, rating } = req.body;

    if (!isValidObjectId(listingId) || !isValidObjectId(userId)) {
      return renderError(res, 'Invalid property or user ID.');
    }

    // Prevent duplicate review
    const exists = await Review.exists({ listingId: listingId, user: userId });
    if (exists) {
      return renderError(res, 'You have already reviewed this property.');
    }

    // XSS filter for content
    const sanitizedContent = xss(comment);
    if (!sanitizedContent || sanitizedContent.length < 2) {
      return renderError(res, 'Review content cannot be empty.');
    }
    if (!rating || rating < 1 || rating > 5) {
      return renderError(res, 'Rating must be between 1 and 5.');
    }

    const review = new Review({
      listingId: listingId,
      guestId: userId,
      content: sanitizedContent,
      rating: Number(rating)
    });
    await review.save();

    res.redirect(`/properties/${listingId}/reviews`);
  } catch (err) {
    next(err);
  }
}

// Get paginated reviews for a property
export async function list(req, res, next) {
  try {
    const { listingId } = req.params;
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    if (!isValidObjectId(listingId)) {
      return renderError(res, 'Invalid property ID.');
    }

    const total = await Review.countDocuments({ listingId: listingId });
    const reviews = await Review.find({ listingId: listingId })
      .populate('user', 'username')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const property = await Property.findById(listingId);

    res.render('reviews/list', {
      reviews,
      property,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
}

// Get all reviews by a user (paginated)
export async function userReviews(req, res, next) {
  try {
    const { userId } = req.params;
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    if (!isValidObjectId(userId)) {
      return renderError(res, 'Invalid user ID.');
    }

    const total = await Review.countDocuments({ guestId: userId });
    const reviews = await Review.find({ guestId: userId })
      .populate('property', 'name')
      .sort({ createdAt: -1 }) 
      .skip((page - 1) * limit)
      .limit(limit);

    const user = await User.findById(userId);

    res.render('reviews/user_reviews', {
      reviews,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      layout: false
    });
  } catch (err) {
    next(err);
  }
}

// Update review (only by the owner)
export async function update(req, res, next) {
  try {
    const { reviewId } = req.params;
    const userId = req.user && req.user._id;
    const { content, rating } = req.body;

    if (!isValidObjectId(reviewId)) {
      return renderError(res, 'Invalid review ID.');
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return renderError(res, 'Review not found.', 404);
    }
    if (review.user.toString() !== userId.toString()) {
      return renderError(res, 'Permission denied.', 403);
    }

    if (content) review.content = xss(content);
    if (rating) review.rating = Number(rating);

    await review.save();
    res.redirect(`/properties/${review.listingId}/reviews`);
  } catch (err) {
    next(err);
  }
}

// Delete review (by owner )
export async function remove(req, res, next) {
  try {
    const { reviewId } = req.params;
    const userId = req.user && req.user._id;

    if (!isValidObjectId(reviewId)) {
      return renderError(res, 'Invalid review ID.');
    }
    const review = await Review.findById(reviewId);
    if (!review) {
      return renderError(res, 'Review not found.', 404);
    }
    if (review.author.toString() !== userId.toString()) {
      return renderError(res, 'Permission denied.', 403);
    }
    await review.remove();
    res.redirect(`/properties/${review.listingId}/reviews`);
  } catch (err) {
    next(err);
  }
}

// Like a review (only once per user)
export async function like(req, res, next) {
  try {
    const { reviewId } = req.params;
    const userId = req.user && req.user._id;

    if (!isValidObjectId(reviewId) || !isValidObjectId(userId)) {
      return renderError(res, 'Invalid review ID or user.');
    }
    const review = await Review.findById(reviewId);
    if (!review) {
      return renderError(res, 'Review not found.', 404);
    }
    if (review.likes.includes(userId)) {
      return renderError(res, 'You have already liked this review.');
    }
    review.likes.push(userId);
    await review.save();
    res.redirect('back');
  } catch (err) {
    next(err);
  }
}

// Unlike a review
export async function unlike(req, res, next) {
  try {
    const { reviewId } = req.params;
    const userId = req.user && req.user._id;

    if (!isValidObjectId(reviewId) || !isValidObjectId(userId)) {
      return renderError(res, 'Invalid review ID or user.');
    }
    const review = await Review.findById(reviewId);
    if (!review) {
      return renderError(res, 'Review not found.', 404);
    }
    const index = review.likes.indexOf(userId);
    if (index === -1) {
      return renderError(res, 'You have not liked this review.');
    }
    review.likes.splice(index, 1);
    await review.save();
    res.redirect('back');
  } catch (err) {
    next(err);
  }
}


// show detail review
export async function show(req, res, next) {
    try {
      const { reviewId } = req.params;
  
      if (!isValidObjectId(reviewId)) {
        return renderError(res, 'Invalid review ID.');
      }
  
      const review = await Review.findById(reviewId)
        .populate('author', 'username')
        .populate('listingId', 'name'); 
  
      if (!review) {
        return renderError(res, 'Review not found.', 404);
      }
  
      res.render('reviews/show', { review });
    } catch (err) {
      next(err);
    }
  }
  
  // edit form
  export async function editForm(req, res, next) {
    try {
      const { reviewId } = req.params;
      const userId = req.user && req.user._id;
  
      if (!isValidObjectId(reviewId)) {
        return renderError(res, 'Invalid review ID.');
      }
      const review = await Review.findById(reviewId);
  
      if (!review) {
        return renderError(res, 'Review not found.', 404);
      }
      if (review.user.toString() !== userId.toString()) {
        return renderError(res, 'Permission denied.', 403);
      }
  
      res.render('reviews/edit', { review });
    } catch (err) {
      next(err);
    }
  }