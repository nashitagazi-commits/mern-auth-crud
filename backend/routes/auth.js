const express = require('express');
const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} = require('../utils/generateTokens');

const router = express.Router();

// Limit brute-force attempts on auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const isProd = process.env.NODE_ENV === 'production';
const refreshCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  path: '/api/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }
  next();
};

// @route   POST /api/auth/register
router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/\d/)
      .withMessage('Password must contain at least one number'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(400);
      throw new Error('An account with that email already exists');
    }

    const user = await User.create({ name, email, password });

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshTokens = [hashToken(refreshToken)];
    user.lastLogin = new Date();
    await user.save();

    res.cookie('refreshToken', refreshToken, refreshCookieOptions);
    res.status(201).json({
      success: true,
      accessToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  })
);

// @route   POST /api/auth/login
router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password +refreshTokens');
    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // keep at most 5 active sessions per user
    user.refreshTokens = [...(user.refreshTokens || []), hashToken(refreshToken)].slice(-5);
    user.lastLogin = new Date();
    await user.save();

    res.cookie('refreshToken', refreshToken, refreshCookieOptions);
    res.json({
      success: true,
      accessToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  })
);

// @route   POST /api/auth/refresh
// Issues a new access token using the httpOnly refresh token cookie
router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const token = req.cookies?.refreshToken;
    if (!token) {
      res.status(401);
      throw new Error('No refresh token provided');
    }

    let decoded;
    try {
      decoded = require('jsonwebtoken').verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      res.status(401);
      throw new Error('Refresh token invalid or expired');
    }

    const user = await User.findById(decoded.id).select('+refreshTokens');
    const hashed = hashToken(token);
    if (!user || !user.refreshTokens.includes(hashed)) {
      res.status(401);
      throw new Error('Refresh token not recognized - please log in again');
    }

    // rotate refresh token
    const newRefreshToken = generateRefreshToken(user._id);
    user.refreshTokens = user.refreshTokens
      .filter((t) => t !== hashed)
      .concat(hashToken(newRefreshToken));
    await user.save();

    const accessToken = generateAccessToken(user._id, user.role);
    res.cookie('refreshToken', newRefreshToken, refreshCookieOptions);
    res.json({ success: true, accessToken });
  })
);

// @route   POST /api/auth/logout
router.post(
  '/logout',
  asyncHandler(async (req, res) => {
    const token = req.cookies?.refreshToken;
    if (token) {
      try {
        const decoded = require('jsonwebtoken').verify(token, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id).select('+refreshTokens');
        if (user) {
          user.refreshTokens = user.refreshTokens.filter((t) => t !== hashToken(token));
          await user.save();
        }
      } catch (err) {
        // token already invalid - nothing to clean up
      }
    }
    res.clearCookie('refreshToken', { path: '/api/auth' });
    res.json({ success: true, message: 'Logged out successfully' });
  })
);

// @route   GET /api/auth/me
router.get(
  '/me',
  protect,
  asyncHandler(async (req, res) => {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        lastLogin: req.user.lastLogin,
      },
    });
  })
);

// @route   POST /api/auth/forgot-password
// Generates a reset token. In production this would be emailed; here we
// return it directly in dev mode so it can be tested without an email service.
router.post(
  '/forgot-password',
  authLimiter,
  [body('email').isEmail().withMessage('Please provide a valid email')],
  validate,
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    // Always respond the same way, whether or not the user exists,
    // so attackers can't use this endpoint to find out which emails are registered
    if (!user) {
      return res.json({
        success: true,
        message: 'If that email is registered, a reset link has been sent',
      });
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'If that email is registered, a reset link has been sent',
      // NOTE: only exposed here because there is no email service configured.
      // Remove this field once you wire up a real mailer (e.g. Nodemailer + SendGrid).
      devResetToken: process.env.NODE_ENV !== 'production' ? resetToken : undefined,
    });
  })
);

// @route   POST /api/auth/reset-password/:token
router.post(
  '/reset-password/:token',
  authLimiter,
  [
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/\d/)
      .withMessage('Password must contain at least one number'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+passwordResetToken +passwordResetExpires +refreshTokens');

    if (!user) {
      res.status(400);
      throw new Error('Reset token is invalid or has expired');
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshTokens = []; // log out of all devices on password reset
    await user.save();

    res.json({ success: true, message: 'Password reset successfully, please log in' });
  })
);

module.exports = router;
