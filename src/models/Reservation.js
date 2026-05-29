const { supabase } = require('../config/supabase');
const { NotFoundError } = require('../utils/errorHandler');

// Récupérer une réservation par ID
const getReservationById = async (reservationId) => {
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .eq('id', reservationId)
    .single();

  if (error || !data) {
    throw new NotFoundError('Réservation', reservationId);
  }

  return data;
};

// Récupérer les réservations d'un propriétaire
const getReservationsByOwnerId = async (proprietaireId, limit = 50, offset = 0) => {
  const { data, error, count } = await supabase
    .from('reservations')
    .select('*', { count: 'exact' })
    .eq('proprietaire_id', proprietaireId)
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return { data, total: count };
};

// Récupérer les réservations d'un gardien
const getReservationsByGardierId = async (gardierId, limit = 50, offset = 0) => {
  const { data, error, count } = await supabase
    .from('reservations')
    .select('*', { count: 'exact' })
    .eq('gardien_id', gardierId)
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return { data, total: count };
};

// Créer une réservation
const createReservation = async (reservationData) => {
  const { data, error } = await supabase
    .from('reservations')
    .insert([
      {
        proprietaire_id: reservationData.proprietaire_id,
        gardien_id: reservationData.gardien_id,
        animal_id: reservationData.animal_id,
        date_debut: reservationData.date_debut,
        date_fin: reservationData.date_fin,
        statut: reservationData.statut || 'en_attente',
        assurance: reservationData.assurance || false,
        instructions: reservationData.instructions || null,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return data;
};

// Mettre à jour une réservation
const updateReservation = async (reservationId, updates) => {
  const { data, error } = await supabase
    .from('reservations')
    .update(updates)
    .eq('id', reservationId)
    .select()
    .single();

  if (error) throw error;

  return data;
};

// Annuler une réservation
const cancelReservation = async (reservationId) => {
  return updateReservation(reservationId, { statut: 'annulee' });
};

// Confirmer une réservation
const confirmReservation = async (reservationId) => {
  return updateReservation(reservationId, { statut: 'confirmee' });
};

// Marquer une réservation comme terminée
const completeReservation = async (reservationId) => {
  return updateReservation(reservationId, { statut: 'terminee' });
};

// Supprimer une réservation
const deleteReservation = async (reservationId) => {
  const { error } = await supabase
    .from('reservations')
    .delete()
    .eq('id', reservationId);

  if (error) throw error;
};

module.exports = {
  getReservationById,
  getReservationsByOwnerId,
  getReservationsByGardierId,
  createReservation,
  updateReservation,
  cancelReservation,
  confirmReservation,
  completeReservation,
  deleteReservation,
};
