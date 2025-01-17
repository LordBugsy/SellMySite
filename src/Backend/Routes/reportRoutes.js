import Report from '../Models/Report.js';
import express from 'express';
import mongoose from 'mongoose';
import User from '../Models/User.js';

const router = express.Router();

// First, let's create an index on the pending field in the Report collection
const createIndexes = async () => {
    try {
        const indexName = 'idxReports_status';
        const existingIndexes = await mongoose.connection.collection('reports').indexExists(indexName);

        if (!existingIndexes) {
            await mongoose.connection.collection('reports').createIndex(
                { status: 1 },
                { background: true, name: indexName } // background: true makes the index creation non-blocking
            );
            console.log(`Index "${indexName}" created successfully!`);
        } 
    } 
    
    catch (error) {
        console.error('Error creating index:', error);
    }
}
createIndexes();

// Create a report
router.post('/create', async (req, res) => {
    try {
        const { reportedTarget, reason, targetID, owner, publicID } = req.body;
        const newReport = new Report({ reportedTarget, reason, targetID, owner, publicID });
        await newReport.save();

        res.status(201).send(newReport);
    } 
    
    catch (error) {
        console.error(error);
        res.status(400).send(error);
    }
});

// Get all pending reports
router.get('/pending', async (req, res) => {
    try {
        const reports = await Report.find({ status: 'pending' }).sort({ createdAt: -1 });
        res.status(200).send(reports);
    } 
    
    catch (error) {
        console.error(error);
        res.status(400).send(error);
    }
});

// Resolve a report
router.post('/resolve', async (req, res) => {
    try {
        const { id, resolvedBy } = req.body;
        if (!id || !resolvedBy) return res.status(400).send('Missing fields');

        const report = await Report.findById(id);
        if (!report) return res.status(404).send('Report not found');

        const checkAdmin = await User.findById(resolvedBy);
        if (checkAdmin.role !== 'admin') return res.status(401).send('Unauthorized');

        report.status = 'resolved';
        report.resolvedBy = resolvedBy;
        await report.save();

        res.status(200).send(report);
    } 
    
    catch (error) {
        console.error(error);
        res.status(400).send(error);
    }
});

export default router;
