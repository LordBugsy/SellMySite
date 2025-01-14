import Announcement from '../Models/Announcement.js';
import User from '../Models/User.js';
import express from 'express';
import bcrypt from 'bcrypt';

const router = express.Router();

// Create an announcement
router.post('/create', async (req, res) => {
    try {
        const { content, madeBy, password } = req.body;
        const user = await User.findOne({ _id: madeBy, role: 'admin' });
        if (!user) {
            return res.status(401).send('Invalid user credentials');
        }

        if (!await bcrypt.compare(password, user.password)) {
            return res.status(401).send('Invalid user credentials');
        }

        const newAnnouncement = new Announcement({ content, madeBy })
        await newAnnouncement.save();

        // since a new announcement has been made, we need to update all users to reflect that they have not read the announcement
        await User.updateMany({}, { hasReadTheAnnouncement: false });

        return res.status(201).send(newAnnouncement);
    } 
    
    catch (error) {
        console.error(error);
        return res.status(400).send(error);
    }
});

// Return the latest announcement
router.get('/latest', async (req, res) => {
    try {
        const latestAnnouncement = await Announcement.findOne().sort({ createdAt: -1 }).populate('madeBy', 'profilePicture username displayName');
        return res.status(200).send(latestAnnouncement);
    } 
    
    catch (error) {
        console.error(error);
        return res.status(400).send(error);
    }
});

// Agree to have read the announcement
router.post('/agree', async (req, res) => {
    try {
        const { userID } = req.body;
        const user = await User.findById(userID);
        if (!user) {
            return res.status(404).send('User not found');
        }

        user.hasReadTheAnnouncement = true;
        await user.save();
        return res.status(200).send('Agreed to have read the announcement');
    }

    catch (error) {
        console.error(error);
        return res.status(400).send("Unexpected error");
    }
});

export default router;