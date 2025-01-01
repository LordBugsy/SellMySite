import Report from '../Models/Report.js';
import express from 'express';
import mongoose from 'mongoose';

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
router.post('/report', async (req, res) => {
    try {
        const { reportedTarget, reason, targetID } = req.body;
        const newReport = new Report({ reportedTarget, reason, targetID });
        await newReport.save();
    } 
    
    catch (error) {
        console.error(error);
        res.status(400).send(error);
    }
});

// Get all pending reports
router.get('/reports/pending', async (req, res) => {
    try {
        const reports = await Report.find({ status: 'pending' });
        res.status(200).send(reports);
    } 
    
    catch (error) {
        console.error(error);
        res.status(400).send(error);
    }
});

// Resolve a report
router.post('/report/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { resolvedBy } = req.body;
        const report = await Report.findById(id);
        if (!report) return res.status(404).send('Report not found');

        report.status = 'resolved';
        report.resolvedBy = resolvedBy;
    } 
    
    catch (error) {
        console.error(error);
        res.status(400).send(error);
    }
});

export default router;
