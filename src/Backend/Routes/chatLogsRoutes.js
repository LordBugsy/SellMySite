import '../Models/ChatLogs.js';
import User from '../Models/User.js';
import ChatLogs from '../Models/ChatLogs.js';
import express from 'express';

const router = express.Router();

// Create a chat log
router.post('/create', async (req, res) => {
    try {
        const { participants, type } = req.body;
        if (!participants || !type) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const uniqueParticipants = [...new Set(participants)];
        const newChat = await ChatLogs.create({
            participants: uniqueParticipants,
            type,
            createdBy: uniqueParticipants.length === 2 ? undefined : uniqueParticipants[0],
            messages: [],
        });

        const users = await User.find({ _id: { $in: uniqueParticipants } });
        if (users.length !== uniqueParticipants.length) {
            throw new Error('One or more users not found');
        }

        if (type === "direct") {
            users.forEach((user) => {
                uniqueParticipants.forEach((otherParticipant) => {
                    if (otherParticipant !== user._id.toString()) {
                        if (!user.privateChatsWith.includes(otherParticipant)) {
                            user.privateChatsWith.push(otherParticipant);
                        }
                    }
                });

                if (!user.joinedChats.includes(newChat._id)) {
                    user.joinedChats.push(newChat._id);
                }
            });
        } 
        
        else if (type === "group") {
            users.forEach((user) => {
                if (!user.joinedChats.includes(newChat._id)) {
                    user.joinedChats.push(newChat._id);
                }
            });
        }

        await Promise.all(users.map((user) => user.save()));

        res.status(201).json({ success: 'Chat created successfully' });
    } 
    
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Send a message to a chat
router.post('/send', async (req, res) => {
    try {
        const { chatID, sender, text } = req.body;
        if (!chatID || !sender || !text) return res.status(400).json({ message: 'Missing required fields' });

        const chat = await ChatLogs.findById(chatID);
        if (!chat) return res.status(404).json({ message: 'Chat not found' });

        chat.messages.push({ sender, text });
        await chat.save();
        res.status(201).json({ success: 'Message sent successfully' });
    } 
    
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete a chat log
router.post('/delete', async (req, res) => {
    try {
        const { chatID } = req.body;
        if (!chatID) return res.status(400).json({ message: 'Missing required fields' });

        const chat = await ChatLogs.findById(chatID);
        if (!chat) return res.status(404).json({ message: 'Chat not found' });

        await Promise.all(chat.participants.map(async (participant) => {
            const user = await User.findById(participant);
            if (!user) throw new Error(`User with ID ${participant} not found`);

            user.joinedChats = user.joinedChats.filter((chat) => chat !== chatID);
            await user.save();
        }));

        await chat.delete();
        res.status(200).json({ success: 'Chat deleted successfully' });
    }

    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get a group chat's info
router.get('/info/:chatID', async (req, res) => {
    try {
        const { chatID } = req.params;
        const chat = await ChatLogs.findById(chatID).populate('participants', 'username displayName profilePicture');
        if (!chat) return res.status(404).json({ message: 'Chat not found' });
        if (chat.type === "direct") return res.status(400).json({ message: 'Chat is not a group chat' });

        res.status(200).json({ chat });
    }

    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get a chat's messages
router.get('/messages/:chatID', async (req, res) => {
    try {
        const { chatID } = req.params;
        const chat = await ChatLogs.findById(chatID).populate('messages.sender', 'username displayName profilePicture');
        if (!chat) return res.status(404).json({ message: 'Chat not found' });

        res.status(200).json({ messages: chat.messages })
    }

    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get a user's chat logs
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId)
            .select('username displayName profilePicture joinedChats') 
            .populate({
                path: 'joinedChats',
                populate: {
                    path: 'participants',
                    select: 'username displayName profilePicture',
                },
            });

        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json(user);
    } 
    
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;