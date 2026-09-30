require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const complaintRoutes = require('./routes/complaintRoutes');

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
  })
);
app.use(express.json());

// Health check (does not need the database)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'HostelHub API is running' });
});

// Make sure the database is connected and tables exist before any route runs.
// On serverless (Vercel) there is no "startup" phase, so we do it lazily per cold start.
let dbPromise = null;
const ensureDb = () => {
  if (!dbPromise) {
    dbPromise = connectDB().catch((err) => {
      dbPromise = null; // allow retry on the next request
      throw err;
    });
  }
  return dbPromise;
};

app.use(async (req, res, next) => {
  try {
    await ensureDb();
    next();
  } catch (err) {
    next(err);
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/complaints', complaintRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

// Only start a listener locally; Vercel runs the exported app as a function.
if (!process.env.VERCEL) {
  ensureDb().then(() => {
    app.listen(PORT, () => {
      console.log(`HostelHub API listening on http://localhost:${PORT}`);
    });
  });
}

module.exports = app;
