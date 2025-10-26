import mongoose from 'mongoose';

const plotSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  size: {
    value: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      enum: ['sqft', 'sqm', 'acres'],
      default: 'sqft'
    }
  },
  soilType: {
    type: String,
    required: true,
    enum: ['clay', 'sandy', 'loamy', 'silt', 'chalky', 'peaty']
  },
  waterAvailability: {
    type: String,
    required: true,
    enum: ['available', 'limited', 'not-available']
  },
  amenities: [String],
  images: [String],
  documents: [{
    name: String,
    url: String,
    type: {
      type: String,
      enum: ['ownership', 'bill', 'other']
    }
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Plot', plotSchema);