const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
    index: true
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    enum: ['harassment', 'inappropriate', 'unhelpful', 'other'],
    required: true
  },
  details: {
    type: String,
    maxlength: 1000,
    default: ''
  },
  status: {
    type: String,
    enum: ['open', 'resolved'],
    default: 'open',
    index: true
  },
  resolution: {
    type: String,
    enum: ['dismissed', 'warned', 'suspended'],
    default: null
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

module.exports = mongoose.model('Report', reportSchema);
