const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const gardienController = require('../controllers/gardienController');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/requireAdmin');

// Routes gardiens (accessibles connecté)
router.get('/gardiens', authenticateToken, gardienController.searchGardiens);
router.get('/gardiens/:id', authenticateToken, gardienController.getGardienProfile);

// Profil personnel
router.get('/me', authenticateToken, userController.getMe);
router.patch('/me', authenticateToken, userController.updateMe);
router.post('/me/verify-identity', authenticateToken, userController.verifyIdentity);

// Admin uniquement
router.get('/', authenticateToken, requireAdmin, userController.getAllUsers);
router.patch('/:id/ban', authenticateToken, requireAdmin, userController.banUser);
router.patch('/:id/verify-gardien', authenticateToken, requireAdmin, userController.verifyGardien);

module.exports = router;
