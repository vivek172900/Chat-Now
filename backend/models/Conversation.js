const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  Conversation_id: {
    type: String,
    required: true,
    unique: true
  },
  members: {
    type: [String],
    required: true
  },
  memberSettings: [{
    userId: {
      type: String,
      required: true
    },
    archived: {
      type: Boolean,
      default: false
    },
    locked: {
      type: Boolean,
      default: false
    },
    favorite: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
});

ConversationSchema.index({ 'memberSettings.userId': 1 });

module.exports = mongoose.model('Conversation', ConversationSchema);