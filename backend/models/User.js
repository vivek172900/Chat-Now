const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    clerkUserId: {
      type: String,
      required: true,
      unique: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    username: {
      type: String,
      trim: true
    },
    profilePic: {
      type: String,
      default: ""
    },
    about: {
      type: String,
      default: "Hey there! I am using Chat App"
    },
    isOnline: {
      type: Boolean,
      default: false
    },
    lastSeen: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);