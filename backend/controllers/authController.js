const jwt = require('jsonwebtoken');
const { User } = require('../models');

const signToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @route  POST /api/auth/register
// @desc   Register a student or admin
// @access Public
const register = async (req, res) => {
  try {
    const { name, email, password, role, rollNumber } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password and role are required' });
    }

    if (!['student', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Role must be either "student" or "admin"' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    if (role === 'student' && !rollNumber) {
      return res.status(400).json({ message: 'Roll number is required for student registration' });
    }

    const existingEmail = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existingEmail) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    if (role === 'student') {
      const existingRoll = await User.findOne({ where: { rollNumber: rollNumber.toUpperCase() } });
      if (existingRoll) {
        return res.status(409).json({ message: 'An account with this roll number already exists' });
      }
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role,
      rollNumber: role === 'student' ? rollNumber.toUpperCase() : null,
    });

    const token = signToken(user);
    return res.status(201).json({ token, user: user.toSafeObject() });
  } catch (err) {
    console.error(err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Duplicate field value, please use another' });
    }
    return res.status(500).json({ message: 'Server error during registration', error: err.message });
  }
};

// @route  POST /api/auth/login
// @desc   Login as student or admin
// @access Public
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Email, password and role are required' });
    }

    const user = await User.scope('withPassword').findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.role !== role) {
      return res.status(403).json({
        message: `This account is registered as ${user.role}. Please login from the ${user.role} tab.`,
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken(user);
    return res.status(200).json({ token, user: user.toSafeObject() });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error during login', error: err.message });
  }
};

// @route  GET /api/auth/me
// @desc   Get currently logged in user
// @access Private
const getMe = async (req, res) => {
  return res.status(200).json({ user: req.user.toSafeObject() });
};

module.exports = { register, login, getMe };
