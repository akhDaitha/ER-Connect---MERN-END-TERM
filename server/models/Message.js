const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  iv: {
    type: String,
    required: true
  },
  data: {
    type: String,
    required: true
  },
  tag: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index on (chat, createdAt) for performant ordered retrieval
messageSchema.index({ chat: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
