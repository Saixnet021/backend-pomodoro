import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import loginHandler from './api/login.js';
import callbackHandler from './api/callback.js';
import playHandler from './api/play.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://saixnet-backend-pomodoro.vercel.app'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/api/login', loginHandler);
app.get('/api/callback', callbackHandler);
app.post('/api/play', playHandler);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Pomodoro Spotify Backend is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: 'Endpoint not found' 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;
