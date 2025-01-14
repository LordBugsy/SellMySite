import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema({
    content: { type: String, required: true },
    madeBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default mongoose.model('Announcement', announcementSchema);