import Announcement from '../Models/Announcement.js';
import User from '../Models/User.js';
import express from 'express';
import bcrypt from 'bcrypt';

const router = express.Router();

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

const createInitialAnnouncement = async () => {
    try {
        const announcement = await Announcement.findOne();
        if (announcement) return; // if an announcement already exists, we don't need to create it again

        let botUser = await User.findOne({ username: "SellMyBot" });
        if (!botUser)  {
            await createBotUser(); // if it doesn't exist, we create it. Even though in "userRoutes.js" it has a check to see if it exists, it's better to have a check here as well.
            botUser = await User.findOne({ username: "SellMyBot" });
        } 

        const newAnnouncement = new Announcement({ 
            content: "# SellMySite\n\nHey! Thank you for testing my project **SellMySite**! I've been working on this project since November 2024 and today, January 29th, it's finally out! I really hope you will have fun with this project. Compared to my previous project [Projectarium](https://github.com/LordBugsy/Projectarium), I really wanted to push my limits when it came to full-stack development. If you have tried Projectarium, you will realise that **a lot more new features** were added! \n\n## New Features\n- **Admin Panel** (Admins can make announcements, create codes and ban users!)\n- **Sell / Auctions on Websites**\n- **Add images to a Post** (Currently, only imgur images are accepted, if you want to edit the code to import images from different sources, feel free to do so!)\n- **Group Chats with up to __10 people__**! (You can also add images in group chats)\n- **Redeem Codes**\n\n## What's next?\nSince I’m the only programmer for this project and have been working on it in my free time, there will most likely **not be any more updates for SellMySite**. Moving forward, I will focus on expanding my knowledge in full-stack development and will be adding more features to my future projects. With that said, expect the next project to be released **in early summer 2025**.\n\nAnyway, thank you for reading, and à la prochaine!\nIf you have any questions, you can find me on [GitHub](https://github.com/LordBugsy) and [Twitter](https://x.com/mylordbugsy) !",
            madeBy: botUser._id
        });
        await newAnnouncement.save();
        console.log('Initial announcement created');
        
    }

    catch (error) {
        console.error('Error creating initial announcement:', error);
    }
}
createInitialAnnouncement();

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