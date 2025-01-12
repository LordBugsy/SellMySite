import mongoose from "mongoose";
import Counter from "./Counter.js";

const codeGenerateSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    maxUses: { type: Number, required: true },
    uses: { type: Number, default: 0 },
    value: { type: Number, required: true },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

codeGenerateSchema.pre('save', async function (next) {
    if (this.isNew) {
        try {
            const counter = await Counter.findOneAndUpdate(
                { name: 'codeGenerate' },
                { $inc: { value: 1 } },
                { new: true, upsert: true }
            );
            next();
        } 
        
        catch (error) {
            next(error);
        }
    } 
    
    else {
        next();
    }
});

export default mongoose.model('CodeGenerate', codeGenerateSchema);