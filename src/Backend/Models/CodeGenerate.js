import mongoose from "mongoose";

const codeGenerateSchema = new mongoose.Schema({
    code: { type: String, required: true },
    maxUses: { type: Number, required: true },
    uses: { type: Number, default: 0 },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });

export default mongoose.model('CodeGenerate', codeGenerateSchema);