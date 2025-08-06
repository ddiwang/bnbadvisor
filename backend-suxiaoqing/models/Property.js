const mongoose = require('mongoose');
const propertySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['apartment', 'house', 'villa', 'cabin', 'loft']
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    pricePerNight: {
        type: Number,
        required: true,
        min: 0
    },
    maxGuests: {
        type: Number,
        required: true,
        min: 1
    },
    bedrooms: {
        type: Number,
        required: true,
        min: 0
    },
    bathrooms: {
        type: Number,
        required: true,
        min: 0
    },
    images: {
        type: [String],
        required: true,
        validate: [arr => ar
            r.length > 0, 'At least one image is required']
    },
    amenities: {
        type: [String],
        default: []
    },
    houseRules: {
        type: String,
        trim: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Property', propertySchema);