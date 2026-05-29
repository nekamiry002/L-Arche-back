const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { authenticateToken } = require('../middleware/auth');

// Toutes les routes réservations nécessitent d'être connecté
router.use(authenticateToken);

// Demande de garde (Création) & Historique
router.post('/', reservationController.createBooking);
router.get('/', reservationController.getMyBookings);
router.get('/:id', reservationController.getBooking);

// Actions sur les statuts (Acceptation, refus, annulation, complétion)
router.patch('/:id/confirm', reservationController.confirmBooking);
router.patch('/:id/cancel', reservationController.cancelBooking);
router.patch('/:id/complete', reservationController.completeBooking);

module.exports = router;
