require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { errorHandler } = require('./utils/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000').split(',');
app.use(cors({
  origin: (origin, callback) => {
    // Autoriser les requêtes sans origin (ex: Postman, scripts node)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} non autorisée`));
  },
  credentials: true,
}));
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
app.use('/api/disponibilites', require('./routes/disponibiliteRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/journaux', require('./routes/journalRoutes'));
app.use('/api/carnets-sante', require('./routes/carnetSanteRoutes'));
app.use('/api/signalements', require('./routes/signalementRoutes'));
app.use('/api/produits',    require('./routes/produitRoutes'));

// Error handling middleware (doit être en dernier)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🐾 L-Arche Backend is running on port ${PORT}`);
});
