const mongoose = require("mongoose");

const chatPreferenceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true
    },
    isArchived: {
      type: Boolean,
      default: false
    },
    isFavorite: {
      type: Boolean,
      default: false
    },
    mutedUntil: Date
  },
  { timestamps: true }
);

chatPreferenceSchema.index({ user: 1, chat: 1 }, { unique: true });

module.exports = mongoose.model("ChatPreference", chatPreferenceSchema);