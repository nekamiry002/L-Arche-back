require('dotenv').config();
const express = require('express');
const cors = require('cors');
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

// Routes will be added here
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/users', require('./routes/users'));
// app.use('/api/animals', require('./routes/animals'));
// app.use('/api/reservations', require('./routes/reservations'));

// Error handling middleware (doit être en dernier)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🐾 L-Arche Backend is running on port ${PORT}`);
});
