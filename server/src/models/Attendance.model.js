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
      coordinates: { type: [Number] }, // [longitude, latitude]
      address: { type: String },
      accuracy: { type: Number },
      ipAddress: { type: String }
    },
    deviceInfo: { type: String },
    selfieUrl: { type: String }, // Optional, mostly for HR
    isVerified: { type: Boolean, default: false } // True if within geofence
  },
  
  checkOut: {
    time: { type: Date },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number] },
      address: { type: String },
      accuracy: { type: Number },
      ipAddress: { type: String }
    },
    deviceInfo: { type: String }
  },
  
  status: { 
    type: String, 
    enum: ['Present', 'Absent', 'Half Day', 'Late', 'Leave', 'Work From Home', 'Weekly Off', 'Company Holiday', 'Paid Leave', 'Unpaid Leave'], 
    default: 'Absent' 
  },
  totalHours: { type: Number, default: 0 },
  totalBreakDuration: { type: Number, default: 0 },
  overtimeHours: { type: Number, default: 0 },
  attendanceSource: { 
    type: String, 
    enum: ['WEB', 'MOBILE', 'BIOMETRIC', 'GPS', 'FACE_RECOGNITION', 'HR', 'SYSTEM']
  },
  notes: { type: String },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
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
attendanceSchema.index({ companyId: 1, date: 1 });
attendanceSchema.index({ status: 1 });

export const Attendance = mongoose.model('Attendance', attendanceSchema);
