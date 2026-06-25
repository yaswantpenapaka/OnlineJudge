import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js';
import { z } from 'zod';

// Validation Schemas
const registerSchema = z.object({
  handle: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
});

const loginSchema = z.object({
  identifier: z.string().min(3), // can be handle or email
  password: z.string().min(6),
});

// @desc    Register new user
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { handle, email, password, confirmPassword } = registerSchema.parse(req.body);

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ 
      $or: [{ email }, { handle }] 
    });

    if (userExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email or handle already exists' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      handle,
      email,
      password: hashedPassword,
    });

    if (user) {
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: {
          _id: user._id,
          handle: user.handle,
          email: user.email,
        },
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { identifier, password } = loginSchema.parse(req.body);

    // Find user by handle or email
    const user = await User.findOne({
      $or: [{ handle: identifier }, { email: identifier }],
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      message: 'Login successful',
      accessToken,
      user: {
        _id: user._id,
        handle: user.handle,
        email: user.email,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -tokenVersion');

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
export const logoutUser = async (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out successfully' });
};