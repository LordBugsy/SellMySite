import Website from "../Models/Website.js";
import express from "express";

const router = express.Router();

// Create a website
router.post("/create", async (req, res) => {
    try {
        const { title, description, owner } = req.body;
        const newWebsite = new Website({ title, description, owner });
        await newWebsite.save();

        res.status(201).send(newWebsite);
    } 
    
    catch (error) {
        console.error(error);
        res.status(400).send(error);
    }
});

// Load the 10 most popular websites

export default router;