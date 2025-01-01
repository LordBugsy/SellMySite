import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, // unique name for the counter (ex: Post, Website, etc..)
    value: { type: Number, required: true } // the current value of the counter
});

export default mongoose.model("Counter", counterSchema);