import mongoose from "mongoose";

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

export default mongoose.model('CodeGenerate', codeGenerateSchema);