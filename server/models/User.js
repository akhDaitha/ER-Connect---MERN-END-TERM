const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  alias: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['client', 'er', 'admin'],
    required: true,
    default: 'client'
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  batch: {
    type: Number,
    required: function () {
      return this.role === 'client';
    }
  },

  // ER specific fields
  ratingSum: {
    type: Number,
    default: 0
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  avgRating: {
    type: Number,
    default: 4.0 // Starts at Bayesian prior mean
  },
  isAvailable: {
    type: Boolean,
    default: false
  },
  isSuspended: {
    type: Boolean,
    default: false
  },
  activeChatCount: {
    type: Number,
    default: 0
  },

  // Client specific fields
  chats: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat'
  }],

  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.index({ role: 1, isAvailable: 1, isSuspended: 1 });

module.exports = mongoose.model('User', userSchema);
