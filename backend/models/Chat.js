const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    isGroupChat: {
      type: Boolean,
      default: false
    },
    chatName: {
      type: String
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message"
    }
  },
  { timestamps: true }
);

chatSchema.index({ participants: 1, updatedAt: -1 });
chatSchema.index({ isGroupChat: 1, participants: 1 });

module.exports = mongoose.model("Chat", chatSchema);