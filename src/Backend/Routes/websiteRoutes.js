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
        const { title, description, owner, link } = req.body;
        const newWebsite = new Website({ title, link, description, owner });
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

            const owner = await User.findById(userID);
            owner.websitesPublished = owner.websitesPublished.filter((publishedWebsite) => publishedWebsite.toString() !== websiteID);
            await owner.save();

            for (const user of website.likes) {
                const currentUser = await User.findById(user);
                currentUser.likedWebsites = currentUser.likedWebsites.filter((likedWebsite) => likedWebsite.toString() !== websiteID);
                await currentUser.save();
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
            const user = await User.findById(userID);
            if (!user.likedWebsites.some((likedWebsite) => likedWebsite.toString() === websiteID)) {
                user.likedWebsites.push(websiteID);
                await user.save();

                website.likes.push(userID);
                await website.save();
                res.status(200).send(true);
            }
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
            const user = await User.findById(userID);
            user.likedWebsites = user.likedWebsites.filter((likedWebsite) => likedWebsite.toString() !== websiteID);
            await user.save();

            website.likes = website.likes.filter((like) => like.toString() !== userID);
            await website.save();
            res.status(200).send(false);
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

// Load comments of a website
router.get("/comments/:websiteID", async (req, res) => {
    const { websiteID } = req.params;

    if (!websiteID) {
        return res.status(400).send("Invalid request");
    }

    else {
        try {
            const website = await Website.findById(websiteID).populate({
                path: "comments.commenter", 
                select: "username displayName profilePicture"
            }).exec();

            const limitedComments = website.comments.slice(0, 15);
            res.status(200).send(limitedComments);
        }
        
        catch (error) {
            console.error(error);
            res.status(400).send(error);
        }
    }
});

// Post a comment on a website
router.post("/comment/publish", async (req, res) => {
    const { websiteID, commenterID, content } = req.body;

    if (!websiteID || !commenterID || !content) {
        return res.status(400).send("Invalid request");
    }

    else {
        try {
            const website = await Website.findById(websiteID);
            website.comments.push({ commenter: commenterID, content });
            await website.save();
            res.status(200).send(website);
        } 
        
        catch (error) {
            console.error(error);
            res.status(400).send(error);
        }
    }
});

// Delete a comment on a website
router.post("/comment/delete", async (req, res) => {
    const { websiteID, commentID, userID } = req.body;

    if (!websiteID || !commentID || !userID) {
        return res.status(400).send("Invalid request");
    }

    else {
        try {
            const website = await Website.findById(websiteID);
            const comment = website.comments.id(commentID);

            if (comment.owner.toString() !== userID && userID !== "admin") {
                return res.status(403).send("Unauthorized");
            }

            comment.remove();
            await website.save();
            res.status(200).send(website);
        } 
        
        catch (error) {
            console.error(error);
            res.status(400).send(error);
        }
    }
});

// Like a comment on a website
router.post("/comment/like", async (req, res) => {
    const { websiteID, commentID, userID } = req.body;

    if (!websiteID || !commentID || !userID) {
        return res.status(400).send("Invalid request");
    }

    else {
        try {
            const website = await Website.findById(websiteID);
            const comment = website.comments.id(commentID);

            if (!comment.likes.some((like) => like.toString() === userID)) {
                comment.likes.push(userID);
                await website.save();
                res.status(200).send(true);
            }
        } 
        
        catch (error) {
            console.error(error);
            res.status(400).send(error);
        }
    }
});

// Unlike a comment on a website
router.post("/comment/unlike", async (req, res) => {
    const { websiteID, commentID, userID } = req.body;

    if (!websiteID || !commentID || !userID) {
        return res.status(400).send("Invalid request");
    }

    else {
        try {
            const website = await Website.findById(websiteID);
            const comment = website.comments.id(commentID);
            comment.likes = comment.likes.filter((like) => like.toString() !== userID);
            await website.save();
            res.status(200).send(false);
        } 
        
        catch (error) {
            console.error(error);
            res.status(400).send(error);
        }
    }
});

// Buy a website
router.post("/buy", async (req, res) => {
    const { websiteID, buyerID } = req.body;

    if (!websiteID || !buyerID) {
        return res.status(400).send("Invalid request");
    }

    else {
        try {
            const website = await Website.findById(websiteID);
            const buyer = await User.findById(buyerID);

            if (buyer.siteTokens >= website.price && website.price > 0) {
                const seller = await User.findById(website.owner);
                seller.siteTokens += website.price;
                seller.websitesPublished = seller.websitesPublished.filter((publishedWebsite) => publishedWebsite.toString() !== websiteID);
                seller.save();

                buyer.siteTokens -= website.price;
                buyer.websitesPublished.push(websiteID);
                website.owner = buyerID;
                await buyer.save();

                website.price = -1; // i set the price to -1 to prevent another user from buying the website right away
                await website.save();
                res.status(200).send(website);
            }
        }

        catch (error) {
            console.error(error);
            res.status(400).send(error);
        }
    }
});

// Edit the title of a website
router.post("/edit/title", async (req, res) => {
    const { websiteID, newTitle, userID } = req.body;

    if (!websiteID || !newTitle || !userID) {
        return res.status(400).send("Invalid request");
    }

    else {
        try {
            const website = await Website.findById(websiteID);
            if (website.owner.toString() !== userID && userID !== "admin") {
                return res.status(403).send("Unauthorized");
            }

            website.title = newTitle;
            await website.save();
            res.status(200).send(website);
        } 
        
        catch (error) {
            console.error(error);
            res.status(400).send(error);
        }
    }
});

// Edit the description of a website
router.post("/edit/description", async (req, res) => {
    const { websiteID, newDescription, userID } = req.body;

    if (!websiteID || !newDescription || !userID) {
        return res.status(400).send("Invalid request");
    }

    else {
        try {
            const website = await Website.findById(websiteID);
            if (website.owner.toString() !== userID && userID !== "admin") {
                return res.status(403).send("Unauthorized");
            }

            website.description = newDescription;
            await website.save();
            res.status(200).send(website);
        } 
        
        catch (error) {
            console.error(error);
            res.status(400).send(error);
        }
    }
});

// Edit the link of a website
router.post("/edit/link", async (req, res) => {
    const { websiteID, newLink, userID } = req.body;

    if (!websiteID || !newLink || !userID) {
        return res.status(400).send("Invalid request");
    }

    else {
        try {
            const website = await Website.findById(websiteID);
            if (website.owner.toString() !== userID && userID !== "admin") {
                return res.status(403).send("Unauthorized");
            }

            website.link = newLink;
            await website.save();
            res.status(200).send(website);
        } 
        
        catch (error) {
            console.error(error);
            res.status(400).send(error);
        }
    }
});

// Edit the price of a website
router.post("/edit/price", async (req, res) => {
    const { websiteID, newPrice, userID } = req.body;

    if (!websiteID || !newPrice || !userID) {
        return res.status(400).send("Invalid request");
    }

    else {
        try {
            const website = await Website.findById(websiteID);
            if (website.owner.toString() !== userID && userID !== "admin") {
                return res.status(403).send("Unauthorized");
            }

            website.price = newPrice;
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
router.get("/:username/:publicWebsiteID", async (req, res) => {
    const { username, publicWebsiteID } = req.params;

    if (!username || !publicWebsiteID) {
        return res.status(400).send("Invalid request");
    }

    else {
        const websiteID = parseInt(publicWebsiteID);

        try {
            const website = await Website.findOne({ publicWebsiteID: websiteID }).populate("owner", "username displayName profilePicture");
            res.status(200).send(website);
        }

        catch (error) {
            console.error(error);
            res.status(400).send(error);
        }
    }
});

export default router;