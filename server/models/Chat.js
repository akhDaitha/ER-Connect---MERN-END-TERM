const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  er: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'ended', 'declined', 'expired'],
    default: 'pending',
    index: true
  },
  endedBy: {
    type: String,
    enum: ['client', 'er', 'system'],
    default: null
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  moodBefore: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  moodAfter: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  crisisFlag: {
    type: Boolean,
    default: false
  },
  startedAt: {
    type: Date,
    default: null
  },
  endedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Compound index for active check and user history queries
chatSchema.index({ client: 1, status: 1 });
chatSchema.index({ er: 1, status: 1 });

module.exports = mongoose.model('Chat', chatSchema);
