const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const env = require('../config/env');
const ApiError = require('../utils/apiError');
const { generateAlias } = require('../utils/aliasGenerator');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

/**
 * Client self-signup
 * Only allowed for client role with institute email domain.
 */
const signup = async (req, res, next) => {
  try {
    const { email, password, gender, batch } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return next(new ApiError(400, 'An account with this email address already exists.'));
    }

    // Generate unique anonymous alias
    let alias = generateAlias();
    let collisionCheck = await User.findOne({ alias });
    while (collisionCheck) {
      alias = generateAlias();
      collisionCheck = await User.findOne({ alias });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      alias,
      email: email.toLowerCase(),
      passwordHash,
      role: 'client', // Clients self-sign up ONLY
      gender,
      batch
    });

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, COOKIE_OPTIONS);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: newUser._id,
        alias: newUser.alias,
        role: newUser.role,
        gender: newUser.gender,
        batch: newUser.batch,
        createdAt: newUser.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * User login (Clients, ERs, Admins)
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return next(new ApiError(401, 'Invalid email or password.'));
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return next(new ApiError(401, 'Invalid email or password.'));
    }

    if (user.role === 'er' && user.isSuspended) {
      return next(new ApiError(403, 'Your Emotional Responder account has been suspended by administration.'));
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, COOKIE_OPTIONS);

    const safeUser = {
      id: user._id,
      alias: user.alias,
      email: user.email,
      role: user.role,
      gender: user.gender,
      batch: user.batch
    };

    if (user.role === 'er') {
      safeUser.isAvailable = user.isAvailable;
      safeUser.avgRating = user.avgRating;
      safeUser.ratingCount = user.ratingCount;
      safeUser.activeChatCount = user.activeChatCount;
    }

    return res.json({
      success: true,
      message: 'Logged in successfully',
      user: safeUser
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout - clears httpOnly auth cookie
 */
const logout = async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax'
  });
  return res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

/**
 * Fetch current authenticated user profile
 */
const getMe = async (req, res) => {
  const user = req.user;
  const safeUser = {
    id: user._id,
    alias: user.alias,
    email: user.email,
    role: user.role,
    gender: user.gender,
    batch: user.batch
  };

  if (user.role === 'er') {
    safeUser.isAvailable = user.isAvailable;
    safeUser.avgRating = user.avgRating;
    safeUser.ratingCount = user.ratingCount;
    safeUser.activeChatCount = user.activeChatCount;
  }

  return res.json({
    success: true,
    user: safeUser
  });
};

const getSocketToken = async (req, res) => {
  const token = jwt.sign(
    { id: req.user._id.toString(), role: req.user.role, purpose: 'socket' },
    env.JWT_SECRET,
    { expiresIn: '2m' }
  );

  res.set('Cache-Control', 'no-store');
  return res.json({ success: true, token });
};

module.exports = {
  signup,
  login,
  logout,
  getMe,
  getSocketToken
};
