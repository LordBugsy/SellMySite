import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    password: { type: String, required: true },
    description: { type: String, default: 'No description provided' },
    isVerified: { type: Boolean, default: false },
    siteTokens: { type: Number, default: 0 },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    profilePicture: {
        type: String,
        default: null, // the value will be changed during the creation of the user's profile
    },
    websitesPublished: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Website', required: true }],
    postsPublished: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    privateChats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    followersMilestones: [{ type: Number }],
}, { timestamps: true });

export default mongoose.model('User', userSchema);