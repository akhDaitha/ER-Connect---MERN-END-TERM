const Report = require('../models/Report');
const ApiError = require('../utils/apiError');

/**
 * Client files a report on a chat session
 */
const createReport = async (req, res, next) => {
  try {
    const { chatId, reason, details } = req.body;
    const chat = req.chat; // Provided by chatParticipantOnly

    if (!req.isClient) {
      return next(new ApiError(403, 'Only students can file reports on chat sessions.'));
    }

    const existingReport = await Report.findOne({
      chat: chat._id,
      reportedBy: req.user._id
    });

    if (existingReport) {
      return next(new ApiError(400, 'You have already submitted a report for this conversation. Our team is reviewing it.'));
    }

    const report = await Report.create({
      chat: chat._id,
      reportedBy: req.user._id,
      reason,
      details: details || '',
      status: 'open'
    });

    const io = req.app.get('io');
    if (io) {
      io.to('admin_room').emit('admin:new_report', {
        reportId: report._id,
        chatId: chat._id,
        reason: report.reason,
        createdAt: report.createdAt
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Your report has been securely submitted to campus counselors and administrators for review.',
      reportId: report._id
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReport
};
