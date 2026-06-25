import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getCurrentUser, 
  logoutUser 
} from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public Routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// Protected Routes
router.get('/me', protect, getCurrentUser);

export default router;