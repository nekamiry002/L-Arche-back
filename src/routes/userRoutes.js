const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const gardienController = require('../controllers/gardienController');
const { authenticateToken } = require('../middleware/auth');

// Routes gardiens (accessibles connecté)
router.get('/gardiens', authenticateToken, gardienController.searchGardiens);
router.get('/gardiens/:id', authenticateToken, gardienController.getGardienProfile);

// Profil personnel
router.get('/me', authenticateToken, userController.getMe);
router.patch('/me', authenticateToken, userController.updateMe);
router.post('/me/verify-identity', authenticateToken, userController.verifyIdentity);

// Admin uniquement
router.get('/', authenticateToken, userController.getAllUsers);

module.exports = router;
