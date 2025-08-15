import mongoose from 'mongoose';


const addressSchema = new mongoose.Schema({
  street: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  postalCode: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    default: 'USA',
    trim: true
  }
});

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['apartment', 'house', 'villa', 'cabin', 'loft', 'condo', 'other'],
    default: 'other'
  },
  address: {
    type: addressSchema,
    required: function() {
      return !this.city; //if no separate city field, address object is required
    }
  },
  city: {
    type: String,
    trim: true,
    required: function() {
      return !this.address || !this.address.city; 
    }
  },
  pricePerNight: {
    type: Number,
    min: 0,
    default: 0
  },
  maxGuests: {
    type: Number,
    min: 1,
    default: 1
  },
  bedrooms: {
    type: Number,
    min: 0,
    default: 0
  },
  bathrooms: {
    type: Number,
    min: 0,
    default: 0
  },
  images: {
    type: [String],
    default: []
  },
  photos: {
    type: [String],
    default: []
  },
  amenities: {
    type: [String],
    default: []
  },
  houseRules: {
    type: [String],
    default: []
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  images: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

propertySchema.virtual('cityName').get(function() {
  return this.address?.city || this.city;
});

propertySchema.virtual('fullAddress').get(function() {
  if (this.address && this.address.street) {
    return `${this.address.street}, ${this.address.city}, ${this.address.state || ''} ${this.address.postalCode || ''}`.trim();
  }
  return this.city || 'Address not specified';
});

export default mongoose.model('Property', propertySchema);