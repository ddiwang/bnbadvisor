import Review from '../models/Review.js';
import Property from '../models/Property.js';

export const createReview = async (req, res) => {
    const { property, propertyId, rating, comment } = req.body;
    const propertyIdToUse = property || propertyId; 
    const user = req.session.user?._id;
    
    try {
        if (!user) {
            return res.status(401).json({ message: 'Please log in to create a review' });
        }

        const propertyExists = await Property.findById(propertyIdToUse);
        if (!propertyExists) {
            return res.status(404).json({ message: 'Property not found' });
        }
        
        // Check if user is the owner of the property
        if (propertyExists.owner && propertyExists.owner.toString() === user.toString()) {
            return res.redirect(`/property/${propertyIdToUse}?error=Property owners cannot review their own properties`);
        }
        
        // Check if user already reviewed this property
        const existingReview = await Review.findOne({ property: propertyIdToUse, user });
        
        if (existingReview) {
            return res.redirect(`/property/${propertyIdToUse}?error=You have already reviewed this property`);
        }
        
        const newReview = new Review({ 
            property: propertyIdToUse, 
            user, 
            rating, 
            comment 
        });
        
        const review = await newReview.save();
        
        // Populate user details
        await review.populate('user', 'firstName lastName');
        await review.populate('property', 'title city');
        
        res.redirect(`/property/${propertyIdToUse}?success=Review added successfully`);
    } catch (error) {
        console.error('Review creation error:', error);
        if (error.name === 'ValidationError') {
            const errorMessages = Object.values(error.errors).map(err => err.message);
            return res.redirect(`/property/${propertyIdToUse}?error=${encodeURIComponent(errorMessages[0])}`);
        }
        
        res.redirect(`/property/${propertyIdToUse}?error=Failed to add review. Please try again.`);
    }
};

export const getReviewById = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id)
            .populate('user', 'firstName lastName')
            .populate('property', 'title city');
            
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        
        res.status(200).json(review);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getReviewsByProperty = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const reviews = await Review.find({ property: propertyId })
            .populate('user', 'firstName lastName')
            .populate('property', 'title city')
            .sort({ createdAt: -1 });
            
        res.status(200).json(reviews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateReview = async (req, res) => {
    const { rating, comment } = req.body;
    const user = req.session.user?._id;
    
    try {
        if (!user) {
            return res.status(401).json({ message: 'Please log in to update a review' });
        }

        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        
        // Check if user owns this review
        if (review.user.toString() !== user.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this review' });
        }
        
        const updatedReview = await Review.findByIdAndUpdate(
            req.params.id,
            { rating, comment },
            { new: true, runValidators: true }
        ).populate('user', 'firstName lastName')
         .populate('property', 'title city');
        
        res.status(200).json({ message: 'Review updated successfully', review: updatedReview });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteReview = async (req, res) => {
    const user = req.session.user?._id;
    
    try {
        if (!user) {
            return res.status(401).json({ message: 'Please log in to delete a review' });
        }

        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        
        // Check if user owns this review
        if (review.user.toString() !== user.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this review' });
        }
        
        await Review.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const likeReview = async (req, res) => {
    try {
      const review = await Review.findById(req.params.id);
      if (!review) {
        return res.status(404).json({ success: false, message: 'Review not found' });
      }
  
      review.likes += 1;
      await review.save();
  
      res.json({ success: true, likes: review.likes });
    } catch (error) {
      console.error('Error liking review:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };
  