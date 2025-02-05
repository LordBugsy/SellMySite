import express from 'express';
import bcrypt from 'bcrypt';
import User from '../Models/User.js';
import Website from '../Models/Website.js';
import Post from '../Models/Post.js';
import mongoose from 'mongoose';

const router = express.Router();

// First, let's create an index on the username field in the User collection
const createIndexes = async () => {
    try {
        const indexName = 'idxUsers_username';
        const existingIndexes = await mongoose.connection.collection('users').indexExists(indexName);
        
        if (!existingIndexes) {
            await mongoose.connection.collection('users').createIndex(
                { username: 1 },
                { background: true, name: indexName } // background: true makes the index creation non-blocking
            );
            console.log(`Index "${indexName}" created successfully!`);
        }
    }
    
    catch (error) {
        console.error('Error creating index:', error);
    }
};
createIndexes();

// Create a bot user
const createBotUser = async () => {
    try {
        if (await User.findOne({ username: 'SellMyBot' })) return;

        const randomString = Math.random().toString(36).substring(7);

        const botUser = new User({
            username: 'SellMyBot',
            displayName: 'SellMyBot',
            password: await bcrypt.hash(randomString, 10),
            role: 'admin',
            profilePicture: 8,
            bannerColour: "8b"
        });
        await botUser.save();

        const botWebsites = [
            { title: 'SellMyBot', description: 'The bot that sells websites', owner: botUser._id, link: 'https://github.com/LordBugsy' },
            { title: 'BuyMyBot', description: 'The bot that buys websites', owner: botUser._id, link: 'https://github.com/LordBugsy' },
            { title: 'ChatMyBot', description: 'The bot that chats with you', owner: botUser._id, link: 'https://github.com/LordBugsy' },
        ];

        for (let website of botWebsites) {
            const newWebsite = new Website(website);
            await newWebsite.save();

            botUser.websitesPublished.push(newWebsite._id);
            await botUser.save();
        }

        const posts = [
            { content: "Welcome to SellMySite! This website was made by LordBugsy using ReactJS, Redux, Express and MongoDB!", owner: botUser._id },
            { 
                content: "I'm SellMyBot, the bot that sells websites! I can help you buy and sell websites, and I can also chat with you!", 
                attachment: 'https://i.imgur.com/CcTMGhv.png', 
                owner: botUser._id 
            },
        ];
        for (let post of posts) {
            const newPost = new Post(post);
            await newPost.save();

            botUser.postsPublished.push(newPost._id);
            await botUser.save();
        }
    }

    catch (error) {
        console.error('Error creating bot user:', error);
    }
};
createBotUser();


// ------------------- User Routes ------------------- //

// Create a new user
router.post('/signup', async (req, res) => {
    try {
        const { username, displayName, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        let profilePictureColour = 0;
        for (let i of username) {
            profilePictureColour += i.charCodeAt(0);
        }
        profilePictureColour %= 8; // 8.png will only be used by the bot
        let bannerColour = `${profilePictureColour}b`;

        // if username already exists
        const user = await User.findOne({ username });
        if (user) return res.status(400).json({ usernameTaken: 'Username already exists' });

        const newUser = new User({
            username,
            displayName,
            password: hashedPassword,
            profilePicture: profilePictureColour,
            bannerColour
        });

        const botUser = await User.findOne({ username: 'SellMyBot' });
        if (botUser) {
            newUser.following.push(botUser._id);
            botUser.followers.push(newUser._id);
            await botUser.save();
        }

        await newUser.save();
        res.status(201).json({
            _id: newUser._id,
            username: newUser.username,
            displayName: newUser.displayName,
            siteTokens: newUser.siteTokens,
            role: newUser.role,
            profilePicture: newUser.profilePicture,
            hasReadTheAnnouncement: newUser.hasReadTheAnnouncement
        });
    }
    
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// Login a user
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // That's not an error, so the status is set to 200
        if (user.accountStatus && user.accountStatus === 'banned') return res.status(200).json({ banMessage: 'This account has been banned' });

        if (await bcrypt.compare(password, user.password)) {
            res.status(200).json({
                _id: user._id,
                username: user.username,
                displayName: user.displayName,
                siteTokens: user.siteTokens,
                role: user.role,
                profilePicture: user.profilePicture,
                hasReadTheAnnouncement: user.hasReadTheAnnouncement
            });
        }

        else res.status(401).json({ message: 'Invalid credentials' });
    }

    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// Change a user's password
router.post('/password', async (req, res) => {
    try {
        const { userID, oldPassword, newPassword } = req.body;
        if (!userID || !oldPassword || !newPassword) return res.status(400).json({ message: 'Missing fields' });

        const user = await User.findById(userID);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (await bcrypt.compare(oldPassword, user.password)) {
            user.password = await bcrypt.hash(newPassword, 10);
            await user.save();

            res.status(200).json({ message: 'Password successfully changed!' });
        }
        
        else res.status(200).json({ message: 'Invalid credentials' });
    }

    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// Change a user's display name
router.post('/displayname', async (req, res) => {
    try {
        const { userID, displayName } = req.body;
        if (!userID || !displayName) return res.status(400).json({ message: 'Missing fields' });

        const user = await User.findById(userID);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.displayName = displayName;
        await user.save();

        res.status(200).json({ message: 'Display name successfully changed!' });
    }

    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// Change a user's description
router.post('/description', async (req, res) => {
    try {
        const { userID, description } = req.body;
        if (!userID || !description) return res.status(400).json({ message: 'Missing fields' });

        const user = await User.findById(userID);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.description = description;
        await user.save();

        res.status(200).json({ message: 'Description successfully changed!' });
    }

    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// Change a user's username
router.post('/username', async (req, res) => {
    try {
        const { userID, newUsername, siteTokens } = req.body;
        if (!userID || !newUsername || !siteTokens) return res.status(400).json({ message: 'Missing fields' });

        const user = await User.findById(userID);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const existingUser = await User.findOne({ username: newUsername });
        if (existingUser) return res.status(400).json({ message: 'Username already exists' });

        if (user.siteTokens < siteTokens) return res.status(400).json({ message: 'Insufficient site tokens' });

        user.username = newUsername;
        user.siteTokens -= siteTokens;
        await user.save();

        res.status(200).json({ message: 'Username successfully changed!' });
    }

    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// Change a user's profile picture
router.post('/profilepicture', async (req, res) => {
    try {
        const { userID, profilePictureID } = req.body;
        if (!userID || !profilePictureID) return res.status(400).json({ message: 'Missing fields' });

        // changing the profile picture will also change the banner
        const user = await User.findById(userID);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.profilePicture = profilePictureID;
        user.bannerColour = `${profilePictureID}b`;
        await user.save();

        res.status(200).json({ successMessage: 'Profile picture successfully changed!' });
    }

    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// Delete a user
router.post('/delete', async (req, res) => {
    try {
        const { userID, password } = req.body;

        const user = await User.findById(userID);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Validate password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ message: 'Invalid credentials' });

        const userIDStr = userID.toString();

        // Fetch all posts and websites created by the user
        const userPosts = await Post.find({ owner: userIDStr }, '_id');
        const userWebsites = await Website.find({ owner: userIDStr }, '_id');

        const userPostIds = userPosts.map(post => post._id.toString());
        const userWebsiteIds = userWebsites.map(website => website._id.toString());

        // Remove the user's creations from other users' likedPosts and likedWebsites arrays
        if (userPostIds.length > 0) {
            await User.updateMany(
                { likedPosts: { $in: userPostIds } },
                { $pull: { likedPosts: { $in: userPostIds } } }
            );
        }

        if (userWebsiteIds.length > 0) {
            await User.updateMany(
                { likedWebsites: { $in: userWebsiteIds } },
                { $pull: { likedWebsites: { $in: userWebsiteIds } } }
            );
        }

        // Remove the user from other users' following and followers lists
        await User.updateMany(
            { following: userIDStr },
            { $pull: { following: userIDStr } }
        );
        await User.updateMany(
            { followers: userIDStr },
            { $pull: { followers: userIDStr } }
        );

        // Remove likes from posts and websites
        await Post.updateMany(
            { likes: userIDStr },
            { $pull: { likes: userIDStr } }
        );
        await Website.updateMany(
            { likes: userIDStr },
            { $pull: { likes: userIDStr } }
        );

        // Delete user's posts and websites
        await Post.deleteMany({ owner: userIDStr });
        await Website.deleteMany({ owner: userIDStr });

        // Finally, delete the user
        await User.findByIdAndDelete(userIDStr);

        res.status(200).json({ message: 'User deleted successfully' });
    } 
    
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// Ban a user
router.post('/ban', async (req, res) => {
    try {
        const { userID, adminID, password, reason } = req.body;
        if (!userID || !adminID || !password || !reason) return res.status(400).json({ message: 'Missing fields' });

        const checkAdmin = await User.findById(adminID);
        if (!checkAdmin || checkAdmin.role !== 'admin') return res.status(401).json({ message: 'Unauthorized Access' });
        if (!bcrypt.compare(password, checkAdmin.password)) return res.status(401).json({ message: 'Invalid credentials' });

        const user = await User.findById(userID);
        if (!user) return res.status(404).json({ message: 'User not found' });
        else if (user.accountStatus === 'banned') return res.status(200).json({ message: 'User already banned' });

        user.accountStatus = 'banned';
        user.banReason = reason;
        await user.save();

        res.status(200).json({ message: 'User banned' });
    }

    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// Follow a user
router.post('/follow', async (req, res) => {
    try {
        const { userID, targetID } = req.body;
        if (!userID || !targetID) return res.status(400).json({ message: 'Missing fields' });

        const user = await User.findById(userID);
        const targetUser = await User.findById(targetID);
        if (!user || !targetUser) return res.status(404).json({ message: 'User not found' });

        if (!user.following.includes(targetID)) {
            user.following.push(targetID);
            targetUser.followers.push(userID);

            const followMilestones = [100, 500, 1000, 5000, 10000, 50000, 100000];
            const currentFollowers = targetUser.followers.length;
            if (followMilestones.includes(currentFollowers) && !targetUser.followersMilestones.some(milestone => milestone.milestone === currentFollowers)) {
                targetUser.followersMilestones.push({ milestone: currentFollowers });
            }

            if (user.followers.includes(targetID) && targetUser.followers.includes(userID)) {
                if (!user.mutualFollowers.includes(targetID)) user.mutualFollowers.push(targetID);
                if (!targetUser.mutualFollowers.includes(userID)) targetUser.mutualFollowers.push(userID);
            }

            await user.save();
            await targetUser.save();

            res.status(200).json({ followSuccess: 'User followed' });
        } 
        
        else {
            res.status(200).json({ followError: 'User already followed' });
        }
    } 
    
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// Unfollow a user
router.post('/unfollow', async (req, res) => {
    try {
        const { userID, targetID } = req.body;
        if (!userID || !targetID) return res.status(400).json({ message: 'Missing fields' });

        const user = await User.findById(userID);
        const targetUser = await User.findById(targetID);
        if (!user || !targetUser) return res.status(404).json({ message: 'User not found' });

        if (user.following.includes(targetID)) {
            user.following = user.following.filter(id => id.toString() !== targetID);
            targetUser.followers = targetUser.followers.filter(id => id.toString() !== userID);

            if (user.mutualFollowers.includes(targetID)) {
                user.mutualFollowers = user.mutualFollowers.filter(id => id.toString() !== targetID);
                targetUser.mutualFollowers = targetUser.mutualFollowers.filter(id => id.toString() !== userID);
            }

            await user.save();
            await targetUser.save();

            res.status(200).json({ unfollowSuccess: 'User unfollowed' });
        } 
        
        else {
            res.status(200).json({ unfollowError: 'User not followed' });
        }
    } 
    
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// Load a user's followers milestones
router.get('/milestones/:userID', async (req, res) => {
    try {
        const { userID } = req.params;
        const user = await User.findById(userID);
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json(user.followersMilestones);
    }

    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// Set a user's notifications to "read"
router.post('/milestones/read', async (req, res) => {
    try {
        const { userID } = req.body;
        if (!userID) return res.status(400).json({ message: 'Missing fields' });

        const user = await User.findById(userID);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.followersMilestones.length > 0) {
            user.followersMilestones.forEach(milestone => milestone.status = 'read');
            await user.save();
        }

        res.status(200).json({ message: 'Milestones marked as read' });
    }

    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// Get a user by username
router.get('/username/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username })
        .populate({
            path: 'followers',
            select: 'username displayName profilePicture'
        })
        .populate({
            path: 'following',
            select: 'username displayName profilePicture'
        })
        .populate({
            path: 'postsPublished',
            select: 'publicPostID content attachment',
            options: { sort: { createdAt: -1 } }
        })
        .populate({
            path: 'websitesPublished',
            select: 'title onSale publicWebsiteID price',
            options: { sort: { createdAt: -1 } }
        });

        if (!user) return res.status(404).json({ message: 'User not found' });
        else {
            res.status(200).json({
                _id: user._id,
                username: user.username,
                displayName: user.displayName,
                description: user.description,
                isVerified: user.isVerified,
                role: user.role === 'admin' ? user.role : undefined,
                mutualFollowers: user.mutualFollowers,
                privateChatsWith: user.privateChatsWith,
                profilePicture: user.profilePicture,
                bannerColour: user.bannerColour,
                websitesPublished: user.websitesPublished,
                postsPublished: user.postsPublished,
                followers: user.followers,
                following: user.following,
                accountStatus: user.accountStatus,
            });
        }
    }

    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// Get the posts of a user by their username
router.get('/posts/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const posts = await Post.find({ owner: user._id });
        res.status(200).json(posts);
    }

    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// Get the websites of a user by their username
router.get('/websites/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const websites = await Website.find({ owner: user._id });
        res.status(200).json(websites);
    }

    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// Get the liked posts of a user by their id
router.get('/likedposts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json(user.likedPosts);
    }

    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// Get the liked websites of a user by their id
router.get('/likedwebsites/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json(user.likedWebsites);
    }
    
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// Get a user by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        else {
            res.status(200).json({
                _id: user._id,
                username: user.username,
                displayName: user.displayName,
                siteTokens: user.siteTokens,
                role: user.role,
            });
        }
    }

    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

export default router;