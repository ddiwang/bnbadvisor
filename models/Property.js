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
  description: {
    type: String,
    trim: true,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  }
});

export default mongoose.model('Property', propertySchema);