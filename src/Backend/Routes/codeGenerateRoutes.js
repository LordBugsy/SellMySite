import express from 'express';
import CodeGenerate from '../Models/CodeGenerate.js';
import User from '../Models/User.js';
import bcrypt from 'bcrypt';

const router = express.Router();

// Create a new code
router.post('/create', async (req, res) => {
    const { code, maxUses, value, userID, password } = req.body;

    try {
        if (!code || !maxUses || !value || !userID || !password) return res.status(400).json({ message: 'Missing fields' });

        const checkAdmin = await User.findById(userID);
        if (checkAdmin.role !== 'admin') return res.status(401).json({ message: 'Unauthorized' });
        if (!await bcrypt.compare(password, checkAdmin.password)) return res.status(401).send('Invalid user credentials');

        if (await CodeGenerate.findOne({ code })) return res.status(409).json({ message: 'Code already exists' });

        const newCode = new CodeGenerate({
            code,
            maxUses,
            value,
            createdBy: userID,
            usedBy: [],
        });

        await newCode.save();
        res.status(201).json("Code created successfully");
    }

    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// Redeeem a code
router.get('/redeem/:code', async (req, res) => {
    const { code } = req.params;
    const { userID } = req.query;

    try {
        const user = await User.findById(userID);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const codeToRedeem = await CodeGenerate.findOne({ code });
        if (!codeToRedeem) return res.status(200).json({ message: "This code doesn't exist!" });

        if (codeToRedeem.uses >= codeToRedeem.maxUses) return res.status(200).json({ message: 'Code expired!' });

        if (user.codeRedeemed && user.codeRedeemed.includes(codeToRedeem._id)) return res.status(200).json({ message: 'You already used the code!' });

        codeToRedeem.uses++;
        codeToRedeem.usedBy.push(userID);
        await codeToRedeem.save();

        user.siteTokens += codeToRedeem.value;
        user.codeRedeemed.push(codeToRedeem._id);
        await user.save();

        res.status(200).json({ message: 'Code redeemed successfully!' });
    }

    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong. Please try again later.' });
    }
});

// Delete a code
router.post('/delete', async (req, res) => {
    const { codeID, userID } = req.body;

    try {
        const checkAdmin = await User.findById(userID);
        if (checkAdmin.role !== 'admin') return res.status(401).json({ message: 'Unauthorized' });

        const codeToDelete = await CodeGenerate.findById(codeID);
        if (!codeToDelete) return res.status(404).json({ message: 'Code not found' });

        await CodeGenerate.findByIdAndDelete(codeID);
        res.status(200).json({ message: 'Code deleted' });
    }

    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

export default router;