const { supabase } = require('../config/supabase');
const { NotFoundError } = require('../utils/errorHandler');

// Récupérer un avis par ID
const getReviewById = async (reviewId) => {
  const { data, error } = await supabase
    .from('avis')
    .select('*')
    .eq('id', reviewId)
    .single();

  if (error || !data) {
    throw new NotFoundError('Avis', reviewId);
  }

  return data;
};

// Récupérer les avis pour une personne (cible)
const getReviewsByTargetId = async (cibleId, limit = 50, offset = 0) => {
  const { data, error, count } = await supabase
    .from('avis')
    .select('*', { count: 'exact' })
    .eq('cible_id', cibleId)
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return { data, total: count };
};

// Récupérer les avis donnés par une personne (auteur)
const getReviewsByAuthorId = async (auteurId, limit = 50, offset = 0) => {
  const { data, error, count } = await supabase
    .from('avis')
    .select('*', { count: 'exact' })
    .eq('auteur_id', auteurId)
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return { data, total: count };
};

// Récupérer les avis pour une réservation spécifique
const getReviewsByReservationId = async (reservationId) => {
  const { data, error } = await supabase
    .from('avis')
    .select('*')
    .eq('reservation_id', reservationId);

  if (error) throw error;

  return data || [];
};

// Créer un avis
const createReview = async (reviewData) => {
  const { data, error } = await supabase
    .from('avis')
    .insert([
      {
        reservation_id: reviewData.reservation_id,
        auteur_id: reviewData.auteur_id,
        cible_id: reviewData.cible_id,
        note: reviewData.note,
        commentaire: reviewData.commentaire || null,
        recommande: reviewData.recommande || false,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return data;
};

// Mettre à jour un avis
const updateReview = async (reviewId, updates) => {
  const { data, error } = await supabase
    .from('avis')
    .update(updates)
    .eq('id', reviewId)
    .select()
    .single();

  if (error) throw error;

  return data;
};

// Supprimer un avis
const deleteReview = async (reviewId) => {
  const { error } = await supabase
    .from('avis')
    .delete()
    .eq('id', reviewId);

  if (error) throw error;
};

// Calculer la note moyenne d'une personne
const calculateAverageRating = async (cibleId) => {
  const { data, error } = await supabase
    .from('avis')
    .select('note')
    .eq('cible_id', cibleId);

  if (error) throw error;

  if (!data || data.length === 0) {
    return { average: null, count: 0 };
  }

  const average = data.reduce((sum, review) => sum + review.note, 0) / data.length;
  return { average: Math.round(average * 100) / 100, count: data.length };
};

module.exports = {
  getReviewById,
  getReviewsByTargetId,
  getReviewsByAuthorId,
  getReviewsByReservationId,
  createReview,
  updateReview,
  deleteReview,
  calculateAverageRating,
};
