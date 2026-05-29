const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

// Toutes les routes utilisateurs nécessitent d'être connecté
router.use(authenticateToken);

// Profil personnel
router.get('/me', userController.getMe);
router.patch('/me', userController.updateMe);
router.post('/me/verify-identity', userController.verifyIdentity);

// Admin uniquement
router.get('/', userController.getAllUsers);

module.exports = router;
