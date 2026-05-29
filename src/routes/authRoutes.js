const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Inscription
router.post('/signup', authController.signup);

// Connexion
router.post('/signin', authController.signin);

// Rafraîchissement de token
router.post('/refresh', authController.refresh);

// Déconnexion
router.post('/signout', authController.signout);

module.exports = router;
