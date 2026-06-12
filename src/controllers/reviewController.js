const Review = require('../models/Review');
const Reservation = require('../models/Reservation');
const { supabase } = require('../config/supabase');
const { validateCreateReview } = require('../utils/validation');
const { ApiError, NotFoundError } = require('../utils/errorHandler');

// GET /api/reviews/user/:userId — avis reçus par un utilisateur (public)
const getReviewsForUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { limit, offset } = req.query;
    const result = await Review.getReviewsByTargetId(
      userId,
      parseInt(limit) || 20,
      parseInt(offset) || 0
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// GET /api/reviews/me — avis que j'ai donnés
const getMyReviews = async (req, res, next) => {
  try {
    const userId = req.user.sub || req.user.id;
    const { limit, offset } = req.query;
    const result = await Review.getReviewsByAuthorId(
      userId,
      parseInt(limit) || 20,
      parseInt(offset) || 0
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// POST /api/reviews — créer un avis
const createReview = async (req, res, next) => {
  try {
    const userId = req.user.sub || req.user.id;
    const { reservation_id, cible_id, note, commentaire, recommande } = req.body;

    if (!reservation_id || !cible_id || note === undefined) {
      throw new ApiError('reservation_id, cible_id et note sont obligatoires', 400);
    }

    validateCreateReview(note, commentaire);

    // La réservation doit être terminée
    const reservation = await Reservation.getReservationById(reservation_id);
    if (reservation.statut !== 'terminee') {
      throw new ApiError('Un avis ne peut être déposé que sur une garde terminée', 400);
    }

    // L'auteur doit être propriétaire ou gardien de cette réservation
    if (reservation.proprietaire_id !== userId && reservation.gardien_id !== userId) {
      throw new ApiError('Vous n\'êtes pas concerné par cette réservation', 403);
    }

    // La cible doit être l'autre partie
    const validTargets = [reservation.proprietaire_id, reservation.gardien_id].filter(id => id !== userId);
    if (!validTargets.includes(cible_id)) {
      throw new ApiError('La cible de l\'avis n\'est pas valide', 400);
    }

    // Un seul avis par (auteur, réservation)
    const existingReviews = await Review.getReviewsByReservationId(reservation_id);
    const alreadyReviewed = existingReviews.some(r => r.auteur_id === userId);
    if (alreadyReviewed) {
      throw new ApiError('Vous avez déjà déposé un avis pour cette réservation', 409);
    }

    const review = await Review.createReview({
      reservation_id,
      auteur_id: userId,
      cible_id,
      note,
      commentaire,
      recommande,
    });

    // Recalculer note_moyenne et nb_avis pour la cible
    await recalculateRating(cible_id);

    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/reviews/:id — supprimer (auteur ou admin)
const deleteReview = async (req, res, next) => {
  try {
    const userId = req.user.sub || req.user.id;
    const { id } = req.params;

    const review = await Review.getReviewById(id);

    if (review.auteur_id !== userId && req.user.role !== 'admin') {
      throw new ApiError('Non autorisé', 403);
    }

    const cibleId = review.cible_id;
    await Review.deleteReview(id);

    // Recalculer la note de la cible
    await recalculateRating(cibleId);

    res.json({ message: 'Avis supprimé' });
  } catch (err) {
    next(err);
  }
};

// Met à jour note_moyenne et nb_avis dans utilisateurs
async function recalculateRating(cibleId) {
  const { average, count } = await Review.calculateAverageRating(cibleId);
  await supabase
    .from('utilisateurs')
    .update({ note_moyenne: average, nb_avis: count })
    .eq('id', cibleId);
}

// GET /api/reviews — tous les avis (admin)
const getAllReviews = async (req, res, next) => {
  try {
    const { limit, offset } = req.query;
    const result = await Review.getAllReviews(
      parseInt(limit) || 50,
      parseInt(offset) || 0
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { getReviewsForUser, getMyReviews, createReview, deleteReview, getAllReviews };
