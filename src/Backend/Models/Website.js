import mongoose from 'mongoose';
import Counter from './Counter.js';

const CommentSchema = new mongoose.Schema({
    commenter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    publishDate: { type: Date, default: Date.now }
});

const websiteSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    onSale: { type: Boolean, default: false },
    price: { type: Number, default: -1 },
    link: { type: String, default: null, required: true },
    auction: {
        isAuction: { type: Boolean, default: false },
        startingPrice: { type: Number, default: -1 },
        currentPrice: { type: Number, default: -1 },
        endDate: { type: Date, default: null },
        bids: [{
            bidder: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            amount: { type: Number, required: true },
        }],
    },
    comments: [CommentSchema],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    publicWebsiteID: { type: Number, unique: true },
}, { timestamps: true });

websiteSchema.pre('save', async function (next) {
    if (this.isNew) {
        try {
            const counter = await Counter.findOneAndUpdate(
                { name: 'website' },
                { $inc: { value: 1 } },
                { new: true, upsert: true }
            );
            this.publicWebsiteID = counter.value;
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

export default mongoose.model('Website', websiteSchema);