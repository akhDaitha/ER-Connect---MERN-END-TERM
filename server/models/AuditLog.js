const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true // e.g. 'VIEW_CHAT_TRANSCRIPT', 'SUSPEND_ER', 'WARN_ER'
  },
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    default: null
  },
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  details: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
