const Reservation = require('../models/Reservation');
const Animal = require('../models/Animal');
const User = require('../models/User');
const { validateCreateReservation } = require('../utils/validation');
const { ApiError } = require('../utils/errorHandler');

// Récupérer l'historique des réservations de l'utilisateur (propriétaire ou gardien)
const getMyBookings = async (req, res, next) => {
  try {
    const userId = req.user.sub || req.user.id;
    const { role, limit, offset } = req.query;
    
    let result;
    const parsedLimit = parseInt(limit) || 50;
    const parsedOffset = parseInt(offset) || 0;

    if (role === 'proprietaire') {
      result = await Reservation.getReservationsByOwnerId(userId, parsedLimit, parsedOffset);
    } else if (role === 'gardien') {
      result = await Reservation.getReservationsByGardierId(userId, parsedLimit, parsedOffset);
    } else {
      // Si aucun rôle n'est spécifié, récupérer toutes les réservations où l'utilisateur participe
      const ownerBookings = await Reservation.getReservationsByOwnerId(userId, 100, 0);
      const gardienBookings = await Reservation.getReservationsByGardierId(userId, 100, 0);
      
      const allReservations = [...ownerBookings.data, ...gardienBookings.data];
      // Trier par date de création décroissante
      allReservations.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      result = {
        data: allReservations.slice(parsedOffset, parsedOffset + parsedLimit),
        total: allReservations.length
      };
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Récupérer une réservation par ID (avec vérification de participation)
const getBooking = async (req, res, next) => {
  try {
    const userId = req.user.sub || req.user.id;
    const bookingId = req.params.id;
    
    const booking = await Reservation.getReservationById(bookingId);

    // Vérifier que l'utilisateur est concerné par cette réservation
    if (booking.proprietaire_id !== userId && booking.gardien_id !== userId && req.user.role !== 'admin') {
      throw new ApiError('Vous n\'êtes pas autorisé à accéder à cette réservation', 403);
    }

    res.json(booking);
  } catch (err) {
    next(err);
  }
};

// Créer une demande de garde
const createBooking = async (req, res, next) => {
  try {
    const userId = req.user.sub || req.user.id;
    const { gardien_id, animal_id, date_debut, date_fin, assurance, instructions } = req.body;

    if (!gardien_id || !animal_id || !date_debut || !date_fin) {
      throw new ApiError('Tous les champs obligatoires doivent être renseignés', 400);
    }

    // 1. Validation de l'appartenance de l'animal
    const animal = await Animal.getAnimalById(animal_id);
    if (animal.proprietaire_id !== userId) {
      throw new ApiError('Cet animal ne vous appartient pas', 403);
    }

    // 2. Vérification que le propriétaire et le gardien sont distincts
    if (userId === gardien_id) {
      throw new ApiError('Vous ne pouvez pas effectuer une réservation chez vous-même', 400);
    }

    // 3. Validation de l'existence et du rôle du gardien
    const gardien = await User.getUserById(gardien_id);
    if (!gardien.est_gardien) {
      throw new ApiError('L\'utilisateur sélectionné n\'est pas un gardien enregistré', 400);
    }

    // 4. Validation des dates
    validateCreateReservation({ date_debut, date_fin });

    // 5. Création
    const booking = await Reservation.createReservation({
      proprietaire_id: userId,
      gardien_id,
      animal_id,
      date_debut,
      date_fin,
      statut: 'en_attente',
      assurance,
      instructions
    });

    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
};

// Confirmer / Accepter une garde (Gardien uniquement)
const confirmBooking = async (req, res, next) => {
  try {
    const userId = req.user.sub || req.user.id;
    const bookingId = req.params.id;

    const booking = await Reservation.getReservationById(bookingId);

    // Seul le gardien désigné peut accepter la réservation
    if (booking.gardien_id !== userId && req.user.role !== 'admin') {
      throw new ApiError('Seul le gardien peut confirmer cette réservation', 403);
    }

    if (booking.statut !== 'en_attente') {
      throw new ApiError(`Impossible de confirmer une réservation avec le statut actuel : ${booking.statut}`, 400);
    }

    const updatedBooking = await Reservation.confirmReservation(bookingId);
    res.json({ message: 'Réservation confirmée avec succès', booking: updatedBooking });
  } catch (err) {
    next(err);
  }
};

// Annuler / Refuser une garde (Propriétaire ou Gardien)
const cancelBooking = async (req, res, next) => {
  try {
    const userId = req.user.sub || req.user.id;
    const bookingId = req.params.id;

    const booking = await Reservation.getReservationById(bookingId);

    // Propriétaire ou Gardien peuvent annuler
    if (booking.proprietaire_id !== userId && booking.gardien_id !== userId && req.user.role !== 'admin') {
      throw new ApiError('Vous n\'êtes pas autorisé à annuler cette réservation', 403);
    }

    if (booking.statut === 'terminee' || booking.statut === 'annulee') {
      throw new ApiError(`Impossible d'annuler une réservation déjà ${booking.statut}`, 400);
    }

    const updatedBooking = await Reservation.cancelReservation(bookingId);
    res.json({ message: 'Réservation annulée avec succès', booking: updatedBooking });
  } catch (err) {
    next(err);
  }
};

// Marquer une garde comme terminée
const completeBooking = async (req, res, next) => {
  try {
    const userId = req.user.sub || req.user.id;
    const bookingId = req.params.id;

    const booking = await Reservation.getReservationById(bookingId);

    // Propriétaire ou Gardien peuvent clore la garde
    if (booking.proprietaire_id !== userId && booking.gardien_id !== userId && req.user.role !== 'admin') {
      throw new ApiError('Vous n\'êtes pas autorisé à modifier cette réservation', 403);
    }

    if (booking.statut !== 'confirmee') {
      throw new ApiError('Seule une réservation confirmée peut être marquée comme terminée', 400);
    }

    const updatedBooking = await Reservation.completeReservation(bookingId);
    res.json({ message: 'Réservation marquée comme terminée avec succès', booking: updatedBooking });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyBookings,
  getBooking,
  createBooking,
  confirmBooking,
  cancelBooking,
  completeBooking,
  getAllBookingsAdmin,
};

// GET /api/reservations/all — toutes les réservations (admin)
async function getAllBookingsAdmin(req, res, next) {
  try {
    const { limit, offset, statut } = req.query;
    const result = await Reservation.getAllReservations(
      parseInt(limit) || 50,
      parseInt(offset) || 0,
      statut || null
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}
