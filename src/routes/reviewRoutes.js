const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticateToken } = require('../middleware/auth');

// Avis reçus par un utilisateur (accessible connecté)
router.get('/user/:userId', authenticateToken, reviewController.getReviewsForUser);

// Routes authentifiées
router.use(authenticateToken);
router.get('/me', reviewController.getMyReviews);
router.post('/', reviewController.createReview);
router.delete('/:id', reviewController.deleteReview);

module.exports = router;
