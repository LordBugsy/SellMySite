import mongoose from "mongoose";
import Counter from "./Counter.js";

const CommentSchema = new mongoose.Schema({
    commenter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    publishDate: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
    publicPostID: { type: Number, unique: true }, 
    content: { type: String, required: true },
    attachment: { type: String, default: undefined },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    comments: [CommentSchema],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });


postSchema.pre("save", async function (next) {
    if (this.isNew) {
        try {
            const counter = await Counter.findOneAndUpdate(
                { name: "post" },
                { $inc: { value: 1 } },
                { new: true, upsert: true }
            );
            this.publicPostID = counter.value;
            next();
        } 
        
        catch (error) {
            next(error);
        }
    } 
    
    else {
        next();
    }
});

export default mongoose.model('Post', postSchema);