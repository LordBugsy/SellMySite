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
import Counter from "./Models/Counter.js";

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

// Routes
app.use('/user', userRoutes);
app.use('/code', codeGenerateRoutes);
app.use('/website', websiteRoutes);
app.use('/post', postRoutes);
app.use('/chatlogs', chatLogsRoutes);
app.use('/report', reportRoutes);

app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
    console.error(`You've reached a route that doesn't exist. You entered: ${req.originalUrl} via ${req.method} method.`);
    res.json({ error: 'This route does not exist' });
});

// Start the server
const PORT = process.env.PORT || 5172; // localhost:5172. We're using this port because 5173 is used by the React app (using it for the API would cause a conflict)
app.listen(PORT, () => console.log(`Server is running on port ${PORT} 🚀`));