import '../Models/ChatLogs.js';
import express from 'express';

const router = express.Router();

// Create a chat log
router.post('/chatlogs/create', async (req, res) => {
    try {
        const { sender, receiver, message } = req.body;
        const newChatLog = new ChatLogs({ sender, receiver, message });
        await newChatLog.save();
        res.status(201).send(newChatLog);
    } 
    
    catch (error) {
        console.error(error);
        res.status(400).send(error);
    }
});

// todo

export default router;