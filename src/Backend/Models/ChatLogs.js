import mongoose from "mongoose";

const chatLogSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    type: { type: String, enum: ["group", "direct"], required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: undefined },
    messages: [{
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: { type: String, required: true },
        attachment: { type: String, default: undefined },
    }],
}, { timestamps: true });

export default mongoose.model('ChatLogs', chatLogSchema);