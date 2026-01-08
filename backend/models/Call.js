const mongoose = require("mongoose");

const callSchema = new mongoose.Schema(
  {
    caller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    receivers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat"
    },
    callType: {
      type: String,
      enum: ["audio", "video"],
      required: true
    },
    status: {
      type: String,
      enum: ["ringing", "ongoing", "ended", "missed"],
      default: "ringing"
    },
    startedAt: Date,
    endedAt: Date
  },
  { timestamps: true }
);

callSchema.index({ caller: 1, createdAt: -1 });
callSchema.index({ receivers: 1, createdAt: -1 });
callSchema.index({ status: 1 });

module.exports = mongoose.model("Call", callSchema);