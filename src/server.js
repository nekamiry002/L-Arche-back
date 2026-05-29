require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { errorHandler } = require('./utils/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});
// Test UI - TEMPORARY
app.use('/test', express.static(path.join(__dirname, '../temp_tests')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/animals', require('./routes/animalRoutes'));
app.use('/api/species', require('./routes/especeRoutes'));
app.use('/api/reservations', require('./routes/reservationRoutes'));

// Error handling middleware (doit être en dernier)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🐾 L-Arche Backend is running on port ${PORT}`);
});
