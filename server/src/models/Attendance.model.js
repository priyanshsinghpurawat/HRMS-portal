import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  employeeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  companyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Company', 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  }, // Normalized to start of day (00:00:00)
  
  checkIn: {
    time: { type: Date },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number] } // [longitude, latitude]
    },
    deviceInfo: { type: String },
    selfieUrl: { type: String }, // Optional, mostly for HR
    isVerified: { type: Boolean, default: false } // True if within geofence
  },
  
  checkOut: {
    time: { type: Date },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number] }
    },
    deviceInfo: { type: String }
  },
  
  status: { 
    type: String, 
    enum: ['Present', 'Absent', 'Half Day', 'Late', 'Leave'], 
    default: 'Absent' 
  },
  totalHours: { type: Number, default: 0 },
  
  auditLogs: [{
    action: { type: String, enum: ['Marked Leave', 'Edited Time', 'Approved Correction'] },
    modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
    reason: { type: String },
    previousState: { type: mongoose.Schema.Types.Mixed }
  }]
}, { timestamps: true });

// Compound index for fast querying per user per day
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

export const Attendance = mongoose.model('Attendance', attendanceSchema);
