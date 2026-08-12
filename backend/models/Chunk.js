const mongoose = require("mongoose");

const chunkSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    repoUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    code: { type: String, required: true },
    startLine: { type: Number, required: true },
    endLine: { type: Number, required: true },
    embedding: { type: [Number], required: true },
  },
  { timestamps: true }
);

const Chunk = mongoose.model("Chunk", chunkSchema);

module.exports = Chunk;