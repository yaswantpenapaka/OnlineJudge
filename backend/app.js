import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes.js';
import errorHandler from './middlewares/error.middleware.js';

const app = express();

// Security Middleware
app.use(helmet());

// CORS Configuration (Important for frontend connection)
app.use(cors({
  origin: 'http://localhost:5173', // Vite default port
  credentials: true,               // Allow cookies to be sent
}));

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie Parser
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);

// Health Check Route
app.get('/', (req, res) => {
  res.json({ message: 'Online Judge API is running...' });
});

// Error Handler (Should be last)
app.use(errorHandler);

export default app;