const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/requireAdmin');

// Avis reçus par un utilisateur (accessible connecté)
router.get('/user/:userId', authenticateToken, reviewController.getReviewsForUser);

// Admin: tous les avis
router.get('/', authenticateToken, requireAdmin, reviewController.getAllReviews);

// Routes authentifiées
router.use(authenticateToken);
router.get('/me', reviewController.getMyReviews);
router.post('/', reviewController.createReview);
router.delete('/:id', reviewController.deleteReview);

module.exports = router;
