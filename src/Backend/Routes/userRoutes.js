import express from 'express';
import bcrypt from 'bcrypt';
import User from '../Models/User.js';
import Website from '../Models/Website.js';
import Post from '../Models/Post.js';
import mongoose from 'mongoose';
import { Link } from 'react-router-dom';

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

        // if username already exists
        const user = await User.findOne({ username });
        if (user) return res.status(400).json({ usernameTaken: 'Username already exists' });

        const newUser = new User({
            username,
            displayName,
            password: hashedPassword,
            profilePicture: profilePictureColour,
        });


        await newUser.save();
        res.status(201).json({
            _id: newUser._id,
            username: newUser.username,
            displayName: newUser.displayName,
            siteTokens: newUser.siteTokens,
            role: newUser.role,
            profilePicture: newUser.profilePicture,
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

        if (await bcrypt.compare(password, user.password)) {
            res.status(200).json({
                _id: user._id,
                username: user.username,
                displayName: user.displayName,
                siteTokens: user.siteTokens,
                role: user.role,
                profilePicture: user.profilePicture
            });
        }

        else res.status(401).json({ message: 'Invalid credentials' });
    }

    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// Delete a user
router.post('/delete', async (req, res) => {
    try {
        const { userID, username, password } = req.body;

        // if done by an admin
        const admin = await User.findById(userID);
        if (admin.role === 'admin') {
            // todo
        }

        const user = await User.findById(userID);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (await bcrypt.compare(password, user.password)) {
            await User.findByIdAndDelete(userID);
            res.status(200).json({ message: 'User deleted' });
        }

        else res.status(401).json({ message: 'Invalid credentials' });
    }

    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// Get a user by username
router.get('/username/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: 'User not found' });
        else {
            res.status(200).json({
                _id: user._id,
                username: user.username,
                displayName: user.displayName,
                description: user.description,
                siteTokens: user.siteTokens,
                isVerified: user.isVerified,
                profilePicture: user.profilePicture,
                websitesPublished: user.websitesPublished,
                postsPublished: user.postsPublished,
                followers: user.followers,
                following: user.following,
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