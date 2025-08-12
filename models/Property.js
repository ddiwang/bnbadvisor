import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,

    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  pricePerNight: {
    type: Number,
    required: true,
    required: true
  }, // 每晚价格
  bedrooms: {
    type: Number,
    required: true,
    default: 1
  },
  bathrooms: {
    type: Number,
    required: true,
    default: 1
  },
  amenities: [String], // 设施
  averageRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  }
});


export default mongoose.models.Property || mongoose.model('Property', propertySchema);
