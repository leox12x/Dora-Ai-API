require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const chatRoutes = require('./routes/chat');
const toolRoutes = require('./routes/tools');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/chat', chatRoutes);
app.use('/tools', toolRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Connect to MongoDB, load tools, and start server
const PORT = process.env.PORT || 3000;
const toolRegistry = require('./services/toolRegistry');

async function start() {
  try {
    // Load tools on startup
    await toolRegistry.loadTools();
    console.log(`Tools loaded: ${toolRegistry.list().join(', ')}`);

    // Connect to MongoDB
    await mongoose.connect(process.env.DB);
    console.log('Connected to MongoDB');

    // Start server
    app.listen(PORT, () => {
      console.log(`Dora API running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Startup error:', err);
    process.exit(1);
  }
}

start();

module.exports = app;
