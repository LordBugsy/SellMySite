import mongoose from "mongoose";

const chatLogSchema = new mongoose.Schema({
    groupChat: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    messages: [{
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: { type: String, required: true },
    }],
}, { timestamps: true });

export default mongoose.model('ChatLogs', chatLogSchema);