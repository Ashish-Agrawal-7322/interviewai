import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';
import bcrypt from 'bcryptjs';

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isPremium: user.isPremium,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isPremium: user.isPremium,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isPremium: user.isPremium,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Send OTP for password reset
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error('User not found with this email');
  }

  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Set expiry to 10 minutes from now
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  user.resetOtp = otp;
  user.resetOtpExpiry = otpExpiry;
  await user.save();

  const message = `
    <h2>Password Reset Request</h2>
    <p>You requested a password reset. Here is your One-Time Password (OTP):</p>
    <h1 style="font-size: 32px; letter-spacing: 5px; color: #4f46e5;">${otp}</h1>
    <p>This OTP is valid for 10 minutes.</p>
    <p>If you did not request this, please ignore this email.</p>
  `;

  await sendEmail({
    to: user.email,
    subject: 'InterviewAI - Password Reset OTP',
    html: message,
  });

  res.status(200).json({ message: 'OTP sent to your email' });
});

// @desc    Verify OTP
// @route   POST /api/users/verify-otp
// @access  Public
const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.resetOtp !== otp) {
    res.status(400);
    throw new Error('Invalid OTP');
  }

  if (new Date() > user.resetOtpExpiry) {
    res.status(400);
    throw new Error('OTP has expired');
  }

  res.status(200).json({ message: 'OTP verified successfully' });
});

// @desc    Reset password
// @route   POST /api/users/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.resetOtp !== otp) {
    res.status(400);
    throw new Error('Invalid OTP');
  }

  if (new Date() > user.resetOtpExpiry) {
    res.status(400);
    throw new Error('OTP has expired');
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  user.password = newPassword;
  user.resetOtp = undefined;
  user.resetOtpExpiry = undefined;
  await user.save();

  res.status(200).json({ message: 'Password reset successfully' });
});

export {
  authUser,
  registerUser,
  getUserProfile,
  forgotPassword,
  verifyOtp,
  resetPassword
};
