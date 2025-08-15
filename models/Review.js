import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
        validate: {
            validator: Number.isInteger,
            message: 'Rating must be a whole number between 1 and 5'
        }
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        minlength: [5, 'Review comment must be at least 5 characters long'],
        maxlength: [1000, 'Review comment cannot exceed 1000 characters']
    },
    likes: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

export default mongoose.model('Review', reviewSchema);
