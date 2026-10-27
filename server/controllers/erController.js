const User = require('../models/User');
const env = require('../config/env');

/**
 * Get available Emotional Responders for clients
 * Strict field projections: alias, gender, avgRating, ratingCount
 * Never exposes real name, email, or sensitive flags
 */
const getAvailableERs = async (req, res, next) => {
  try {
    const { gender, minRating, matchBest } = req.query;

    const query = {
      role: 'er',
      isAvailable: true,
      isSuspended: false,
      activeChatCount: { $lt: env.MAX_CONCURRENT_CHATS_PER_ER }
    };

    if (gender && gender !== 'all' && gender !== 'no_preference') {
      query.gender = gender;
    }

    if (minRating) {
      query.avgRating = { $gte: parseFloat(minRating) };
    }

    let ersQuery = User.find(query)
      .select('_id alias gender avgRating ratingCount activeChatCount')
      .sort({ avgRating: -1, ratingCount: -1 });

    const ers = await ersQuery.exec();

    // If matchBest requested, client can get top match
    if (matchBest === 'true' && ers.length > 0) {
      return res.json({
        success: true,
        bestMatch: ers[0],
        ers
      });
    }

    return res.json({
      success: true,
      count: ers.length,
      ers
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ER updates their own availability
 */
const updateAvailability = async (req, res, next) => {
  try {
    const { isAvailable } = req.body;
    const user = await User.findById(req.user._id);

    if (!user || user.role !== 'er') {
      return res.status(403).json({ success: false, message: 'Only ERs can toggle availability.' });
    }

    user.isAvailable = Boolean(isAvailable);
    await user.save();

    return res.json({
      success: true,
      isAvailable: user.isAvailable,
      message: `Status updated to ${user.isAvailable ? 'Available' : 'Offline'}`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAvailableERs,
  updateAvailability
};
