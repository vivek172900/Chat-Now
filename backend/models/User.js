const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      unique: true,
      sparse: true,
      default: null
    },
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
    wallpaper: {
      type: String,
      default: "blue-gradient"
    },
    messageTheme: {
      type: String,
      default: "default"
    },
    about: {
      type: String,
      default: "Hey there! I am using Chat App"
    },
    isOnline: {
      type: Boolean,
      default: false
    },
    lastSeen: Date,
    pinHash: { type: String, default: null },
    pinEnabled: { type: Boolean, default: false }
  },
  { timestamps: true }
);

userSchema.index({ userId: 1 });
userSchema.index({ clerkUserId: 1 });
userSchema.index({ email: 1 });

module.exports = mongoose.model("User", userSchema);















// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema(
//   {
//     clerkUserId: {
//       type: String,
//       required: true,
//       unique: true
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: true
//     },
//     username: {
//       type: String,
//       trim: true
//     },
//     profilePic: {
//       type: String,
//       default: ""
//     },
//     wallpaper: {
//       type: String,
//       default: "blue-gradient"
//     },
//     messageTheme: {
//       type: String,
//       default: "default"
//     },
//     about: {
//       type: String,
//       default: "Hey there! I am using Chat App"
//     },
//     isOnline: {
//       type: Boolean,
//       default: false
//     },
//     lastSeen: Date
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("User", userSchema);