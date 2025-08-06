const Review = require('../models/Review');
const Property = require('../models/Property');

const createReview = async (req, res) => {
    const { property, rating, comment } = req.body;
    const user = req.user.id; 
    try {
        const propertyExists = await Property.findById(property);
        if (!propertyExists) {
            return res.status(404).json({ message: 'Property not found' });
        }
        
        // Check if user already reviewed this property
        const existingReview = await Review.findOne({ property, user });
        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this property' });
        }
        
        const newReview = new Review({ property, user, rating, comment });
        const review = await newReview.save();
        
        // Populate user and property details
        await review.populate('user', 'firstName lastName');
        await review.populate('property', 'title city');
        
        res.status(201).json({ message: 'Review created successfully', review });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getReviewById = async (req, res) => {
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

const updateReview = async (req, res) => {
    const { rating, comment } = req.body;
    const user = req.user.id;
    
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        
        // Check if user owns this review
        if (review.user.toString() !== user) {
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

const deleteReview = async (req, res) => {
    const user = req.user.id;
    
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        
        // Check if user owns this review
        if (review.user.toString() !== user) {
            return res.status(403).json({ message: 'Not authorized to delete this review' });
        }
        
        await Review.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { createReview, getReviewById, updateReview, deleteReview };
