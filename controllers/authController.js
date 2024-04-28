// controllers/authController.js

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register user
exports.register = async (req, res) => {
  // Check if user exists
  const userExists = await User.findOne({ email: req.body.email });
  if (userExists) return res.status(400).json({ error: 'Email already exists' });

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  // Create user
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: hashedPassword
  });

  try {
    const savedUser = await user.save();
    res.json({ user: savedUser._id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  // Check if email exists
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).json({ error: 'Email not found' });

  // Check password
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

  // Create and assign token
  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
  res.header('auth-token', token).json({ token });
};
