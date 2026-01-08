const mongoose = require("mongoose");

const socketSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  socketId: String,
  connectedAt: {
    type: Date,
    default: Date.now
  }
});

socketSessionSchema.index({ user: 1 }, { unique: false });
socketSessionSchema.index({ socketId: 1 }, { unique: true });

module.exports = mongoose.model("SocketSession", socketSessionSchema);