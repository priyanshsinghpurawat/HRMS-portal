import mongoose, { Schema } from "mongoose";

const systemAuditSchema = new Schema({
    companyId: { type: Schema.Types.ObjectId, ref: "Company", index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    action: { type: String, required: true, index: true },
    module: { type: String, required: true },
    ipAddress: { type: String },
    userAgent: { type: String },
    details: { type: Object },
    timestamp: { type: Date, default: Date.now, index: true }
}, {
    timestamps: false,
    capped: { size: 1024 * 1024 * 100, max: 100000 } // 100MB capped collection to prevent unbounded growth
});

export const SystemAudit = mongoose.model("SystemAudit", systemAuditSchema);
