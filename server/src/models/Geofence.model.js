import mongoose from 'mongoose';

const geofenceSchema = new mongoose.Schema({
  companyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Company', 
    required: true 
  },
  branchName: { 
    type: String, 
    required: true 
  },
  location: {
    type: { 
      type: String, 
      enum: ['Point'], 
      required: true, 
      default: 'Point' 
    },
    coordinates: { 
      type: [Number], // [longitude, latitude]
      required: true 
    }
  },
  allowedRadius: { 
    type: Number, 
    required: true, 
    default: 100 // in meters
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

// Index for geospatial queries
geofenceSchema.index({ location: '2dsphere' });

export const Geofence = mongoose.model('Geofence', geofenceSchema);
