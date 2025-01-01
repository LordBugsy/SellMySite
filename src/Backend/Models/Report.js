import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
    reportedTarget: { type: String, enum: ['User', 'Post', 'Website'], required: true }, // What are you reporting? A user, a post, or a website?
    reason: { type: String, required: true }, // Why are you reporting this?
    targetID: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'reportedTarget' }, // The ID of the reported target (user, post, or website)
    status: { type: String, enum: ['pending', 'resolved'], default: 'pending' }, // The status of the report
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // The ID of the user who resolved the report
}, { timestamps: true });

export default mongoose.model('Report', reportSchema);