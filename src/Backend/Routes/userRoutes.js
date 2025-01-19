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

// Delete a user
router.post('/delete', async (req, res) => {
    try {
        const { userID, password } = req.body;

        const user = await User.findById(userID);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (await bcrypt.compare(password, user.password)) {
            // Delete all posts and websites of the user
            await Post.deleteMany({ owner: userID });
            await Website.deleteMany({ owner: userID });

            // For each user that follows the user, remove the user from their following list
            for (const followerID of user.followers) {
                const follower = await User.findById(followerID);
                follower.following = follower.following.filter(id => id.toString() !== userID);
                await follower.save();
            }

            // For each user that the user follows, remove the user from their followers list
            for (const followingID of user.following) {
                const following = await User.findById(followingID);
                following.followers = following.followers.filter(id => id.toString() !== userID);
                await following.save();
            }

            // For each post or website the user liked, remove the user from the likes list
            const posts = await Post.find({ likes: userID });
            for (const post of posts) {
                post.likes = post.likes.filter(id => id.toString() !== userID);
                await post.save();
            }

            const websites = await Website.find({ likes: userID });
            for (const website of websites) {
                website.likes = website.likes.filter(id => id.toString() !== userID);
                await website.save();
            }

            await User.findByIdAndDelete(userID);
            res.status(200).json({ message: 'User deleted' });
        }

        else res.status(401).json({ message: 'Invalid credentials' });
    }

    catch (error) {
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
            await user.save();

            targetUser.followers.push(userID);
            await targetUser.save();

            res.status(200).json({ followSuccess: 'User followed' });
        }

        else res.status(200).json({ followError: 'User already followed' });
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
            await user.save();

            targetUser.followers = targetUser.followers.filter(id => id.toString() !== userID);
            await targetUser.save();

            res.status(200).json({ unfollowSuccess: 'User unfollowed' });
        }

        else res.status(200).json({ unfollowError: 'User not followed' });
    }

    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// Get a user by username
router.get('/username/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username }).populate('followers', 'username displayName profilePicture').populate('following', 'username displayName profilePicture');

        if (!user) return res.status(404).json({ message: 'User not found' });
        else {
            res.status(200).json({
                _id: user._id,
                username: user.username,
                displayName: user.displayName,
                description: user.description,
                isVerified: user.isVerified,
                role: user.role === 'admin' ? user.role : undefined,
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