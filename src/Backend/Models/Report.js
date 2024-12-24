import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
    reportedTarget: { type: String, enum: ['user', 'post', 'website'], required: true },
    reason: { type: String, required: true },
    targetID: { type: mongoose.Schema.Types.ObjectId, required: true, ref: reportedTarget.charAt(0).toUpperCase() + reportedTarget.slice(1) },
}, { timestamps: true });

export default mongoose.model('Report', reportSchema);