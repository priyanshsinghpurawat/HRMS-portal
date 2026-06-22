import mongoose from 'mongoose';

const correctionSchema = new mongoose.Schema({
  employeeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  attendanceId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Attendance' 
  },
  date: { 
    type: Date, 
    required: true 
  },
  requestType: { 
    type: String, 
    enum: ['Missed Check-In', 'Missed Check-Out', 'Modify Time', 'Leave'],
    required: true
  },
  requestedTime: { 
    type: Date 
  },
  reason: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'], 
    default: 'Pending' 
  },
  resolvedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  hrComment: { 
    type: String 
  }
}, { timestamps: true });

export const CorrectionRequest = mongoose.model('CorrectionRequest', correctionSchema);
