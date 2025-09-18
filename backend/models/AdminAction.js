// backend/models/AdminAction.js
import mongoose from "mongoose";

const AdminActionSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  action: { type: String, required: true },
  target: { type: mongoose.Schema.Types.ObjectId, refPath: "targetModel" },
  targetModel: { type: String, default: "User" },
  details: { type: Object, default: {} },
}, { timestamps: true });

export default mongoose.model("AdminAction", AdminActionSchema);
