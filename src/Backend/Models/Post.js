import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
    commenter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    publishDate: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
    content: { type: String, required: true },
    attachment: { type: String, default: undefined },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    comments: [CommentSchema],
}, { timestamps: true });

export default mongoose.model('Post', postSchema);