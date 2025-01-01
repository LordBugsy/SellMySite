import express from 'express';
import CodeGenerate from '../Models/CodeGenerate.js';
import User from '../Models/User.js';

const router = express.Router();

// Create a new code
router.post('/create', async (req, res) => {
    const { code, maxUses, value, userID } = req.body;

    const checkAdmin = await User.findById(userID);
    if (checkAdmin.role !== 'admin') return res.status(401).json({ message: 'Unauthorized' });

    const newCode = new CodeGenerate({
        code,
        maxUses,
        value,
        createdBy: userID,
        usedBy: [],
    });

    try {
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
    const { userID } = req.body;

    const user = await User.findById(userID);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const codeToRedeem = await CodeGenerate.findOne({ code });
    if (!codeToRedeem) return res.status(404).json({ message: 'Code not found' });

    if (codeToRedeem.uses >= codeToRedeem.maxUses) return res.status(403).json({ message: 'Code expired' });

    if (codeToRedeem.usedBy.includes(userID)) return res.status(403).json({ message: 'Code already used' });

    codeToRedeem.uses++;
    codeToRedeem.usedBy.push(userID);

    user.siteTokens += codeToRedeem.value;

    try {
        await codeToRedeem.save();
        await user.save();
        res.status(200).json({ message: 'Code redeemed' });
    }

    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// Delete a code
router.post('/delete', async (req, res) => {
    const { codeID, userID } = req.body;

    const checkAdmin = await User.findById(userID);
    if (checkAdmin.role !== 'admin') return res.status(401).json({ message: 'Unauthorized' });

    const codeToDelete = await CodeGenerate.findById(codeID);
    if (!codeToDelete) return res.status(404).json({ message: 'Code not found' });

    try {
        await CodeGenerate.findByIdAndDelete(codeID);
        res.status(200).json({ message: 'Code deleted' });
    }

    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

export default router;