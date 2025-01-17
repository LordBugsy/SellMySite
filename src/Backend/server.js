import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import userRoutes from './Routes/userRoutes.js';
import codeGenerateRoutes from './Routes/codeGenerateRoutes.js';
import websiteRoutes from './Routes/websiteRoutes.js';
import postRoutes from './Routes/postRoutes.js';
import chatLogsRoutes from './Routes/chatLogsRoutes.js';
import reportRoutes from './Routes/reportRoutes.js';
import announcementRoutes from './Routes/announcementRoutes.js';
import Counter from "./Models/Counter.js";
import Post from "./Models/Post.js";
import User from "./Models/User.js";
import Website from "./Models/Website.js";

// Simulate __dirname in ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the path to the .env file (.env and server.js are in the same directory)
const envPath = path.resolve(__dirname, '.env');

// Load environment variables from .env file
dotenv.config({ path: envPath });

const app = express(); // Setup the express server

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

(async () => {
    try {
        const existingCounter = await Counter.findOne({ name: "user" });
        if (!existingCounter) {
            await Counter.create({ name: "user", value: 0 });
            console.log("User counter initialised with value 0");
        }
    } 
    catch (error) {
        console.error("Error initialising user counter:", error);
    }
})();

// Create a counter for posts
(async () => {
    try {
        const existingCounter = await Counter.findOne({ name: "post" });
        if (!existingCounter) {
            await Counter.create({ name: "post", value: 0 });
            console.log("Post counter initialised with value 0");
        }
    } 
    
    catch (error) {
        console.error("Error initialising post counter:", error);
    }
})();

// Create a counter for websites
(async () => {
    try {
        const existingCounter = await Counter.findOne({ name: "website" });
        if (!existingCounter) {
            await Counter.create({ name: "website", value: 0 });
            console.log("Website counter initialised with value 0");
        }
    } 
    
    catch (error) {
        console.error("Error initialising website counter:", error);
    }
})();

// ==== The following counters will only be used to monitor how many "x" have been created ==== //
// Create a counter for users
(async () => {
    try {
        const existingCounter = await Counter.findOne({ name: "user" });
        if (!existingCounter) {
            await Counter.create({ name: "user", value: 0 });
            console.log("User counter initialised with value 0");
        }
    } 
    
    catch (error) {
        console.error("Error initialising user counter:", error);
    }
})();

// Create a counter for reports
(async () => {
    try {
        const existingCounter = await Counter.findOne({ name: "report" });
        if (!existingCounter) {
            await Counter.create({ name: "report", value: 0 });
            console.log("Report counter initialised with value 0");
        }
    } 
    
    catch (error) {
        console.error("Error initialising report counter:", error);
    }
})();

// Create a counter for the number of code generations
(async () => {
    try {
        const existingCounter = await Counter.findOne({ name: "code" });
        if (!existingCounter) {
            await Counter.create({ name: "code", value: 0 });
            console.log("Code counter initialised with value 0");
        }
    } 
    
    catch (error) {
        console.error("Error initialising code counter:", error);
    }
})();

// Routes
app.use('/user', userRoutes);
app.use('/code', codeGenerateRoutes);
app.use('/website', websiteRoutes);
app.use('/post', postRoutes);
app.use('/chatlogs', chatLogsRoutes);
app.use('/report', reportRoutes);
app.use('/announcement', announcementRoutes);

app.use(express.static(path.join(__dirname, 'build')));

app.get("/search/:query", async (req, res) => {
    const query = req.params.query;
    if (!query) return res.status(400).send("No query provided");

    try {
        const users = await User.find({ username: { $regex: query, $options: 'i' } });
        const userIds = users.map(user => user._id);

        const posts = await Post.find({
            $or: [
                { content: { $regex: query, $options: 'i' } },
                { owner: { $in: userIds } }
            ]
        }).populate("owner", "username displayName profilePicture");

        const websites = await Website.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { link: { $regex: query, $options: 'i' } },
                { owner: { $in: userIds } }
            ]
        }).populate("owner", "username profilePicture");

        if (posts.length === 0 && websites.length === 0) return res.status(200).json({ noResultsMessage: "No results found" });

        res.status(200).send({ posts, websites });
    } 
    
    catch (error) {
        console.error("Error during search:", error);
        res.status(500).send({ error: "An internal error occurred during the search operation" });
    }
});

app.get('*', (req, res) => {
    console.error(`You've reached a route that doesn't exist. You entered: ${req.originalUrl} via ${req.method} method.`);
    res.json({ error: 'This route does not exist' });
});

// Start the server
const PORT = process.env.PORT || 5172; // localhost:5172. We're using this port because 5173 is used by the React app (using it for the API would cause a conflict)
app.listen(PORT, () => console.log(`Server is running on port ${PORT} 🚀`));