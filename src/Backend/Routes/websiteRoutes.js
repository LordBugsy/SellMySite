import mongoose from "mongoose";
import Website from "../Models/Website.js";
import User from "../Models/User.js";
import express from "express";

const router = express.Router();

// First, let's start by creating the indexes
const createIndexes = async () => {
    try {
        const indexName = "idxWebsites_publicWebsiteID";
        const existingIndexes = await mongoose.connection.collection("websites").indexExists(indexName);

        if (!existingIndexes) {
            await mongoose.connection.collection('websites').createIndex(
                { publicWebsiteID: 1 },
                { background: true, name: indexName } // background: true makes the index creation non-blocking
            );
            console.log(`Index "${indexName}" created successfully!`);
        }

        const indexName2 = "idxWebsites_owner";
        const existingIndexes2 = await mongoose.connection.collection("websites").indexExists(indexName2);

        if (!existingIndexes2) {
            await mongoose.connection.collection('websites').createIndex(
                { owner: 1 },
                { background: true, name: indexName2 } // background: true makes the index creation non-blocking
            );
            console.log(`Index "${indexName2}" created successfully!`);
        }
    }

    catch (error) {
        console.error("Error creating indexes:", error);
    }
}
createIndexes();

// Create a website
router.post("/create", async (req, res) => {
    try {
        const { title, description, owner } = req.body;
        const newWebsite = new Website({ title, description, owner });
        newWebsite.likes.push(owner);
        await newWebsite.save();

        const originalOwner = await User.findById(owner);
        originalOwner.websitesPublished.push(newWebsite._id);
        originalOwner.likedWebsites.push(newWebsite._id);
        await originalOwner.save();

        res.status(201).send(newWebsite);
    } 
    
    catch (error) {
        console.error(error);
        res.status(400).send(error);
    }
});

// Delete a website
router.post("/delete", async (req, res) => {
    const { userID, websiteID } = req.body;

    if (!websiteID || !userID) {
        return res.status(400).send("Invalid request");
    }

    else {
        try {
            const website = await Website.findById(websiteID);
            if (website.owner.toString() !== userID && userID !== "admin") {
                return res.status(403).send("Unauthorized");
            }

            await Website.findByIdAndDelete(websiteID);
            res.status(200).send("Website deleted");
        } 
        
        catch (error) {
            console.error(error);
            res.status(400).send(error);
        }
    }
});

// Like a website
router.post("/like", async (req, res) => {
    const { websiteID, userID } = req.body;

    if (!websiteID || !userID) {
        return res.status(400).send("Invalid request");
    }

    else {
        try {
            const website = await Website.findById(websiteID);
            if (website.likes.includes(userID)) {
                return res.status(400).send("User already liked this website");
            }

            website.likes.push(userID);
            await website.save();
            res.status(200).send(website);
        } 
        
        catch (error) {
            console.error(error);
            res.status(400).send(error);
        }
    }
});

// Unlike a website
router.post("/unlike", async (req, res) => {
    const { websiteID, userID } = req.body;

    if (!websiteID || !userID) {
        return res.status(400).send("Invalid request");
    }

    else {
        try {
            const website = await Website.findById(websiteID);
            if (!website.likes.includes(userID)) {
                return res.status(400).send("User has not liked this website");
            }

            website.likes = website.likes.filter((like) => like.toString() !== userID);
            await website.save();
            res.status(200).send(website);
        } 
        
        catch (error) {
            console.error(error);
            res.status(400).send(error);
        }
    }
});

// Load a website
router.get("/:username/:websiteID", async (req, res) => {
    const { username, websiteID } = req.params;

    if (!username || !websiteID) {
        return res.status(400).send("Invalid request");
    }

    else {
        try {
            const website = await Website.findById(websiteID).populate("owner", "username profilePicture");
            res.status(200).send(website);
        }

        catch (error) {
            console.error(error);
            res.status(400).send(error);
        }
    }
});

// Load the 10 most popular websites
router.get("/popular", async (req, res) => {
    try {
        const websites = await Website.find().sort({ likes: -1 }).limit(10).populate("owner", "username profilePicture");
        res.status(200).send(websites);
    } 
    
    catch (error) {
        console.error(error);
        res.status(400).send(error);
    }
});

export default router;