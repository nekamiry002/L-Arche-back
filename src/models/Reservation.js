const { supabase, supabaseAdmin } = require('../config/supabase');
const db = supabaseAdmin || supabase;
const { NotFoundError } = require('../utils/errorHandler');

// RÃ©cupÃ©rer une rÃ©servation par ID
const getReservationById = async (reservationId) => {
  const { data, error } = await db
    .from('reservations')
    .select('*')
    .eq('id', reservationId)
    .single();

  if (error || !data) {
    throw new NotFoundError('Réservation', reservationId);
  }

  return data;
};

// RÃ©cupÃ©rer les rÃ©servations d'un propriÃ©taire
const getReservationsByOwnerId = async (proprietaireId, limit = 50, offset = 0) => {
  const { data, error, count } = await db
    .from('reservations')
    .select('*', { count: 'exact' })
    .eq('proprietaire_id', proprietaireId)
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return { data, total: count };
};

// RÃ©cupÃ©rer les rÃ©servations d'un gardien
const getReservationsByGardierId = async (gardierId, limit = 50, offset = 0) => {
  const { data, error, count } = await db
    .from('reservations')
    .select('*', { count: 'exact' })
    .eq('gardien_id', gardierId)
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return { data, total: count };
};

// CrÃ©er une rÃ©servation
const createReservation = async (reservationData) => {
  const { data, error } = await db
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

// Mettre Ã  jour une rÃ©servation
const updateReservation = async (reservationId, updates) => {
  const { data, error } = await db
    .from('reservations')
    .update(updates)
    .eq('id', reservationId)
    .select()
    .single();

  if (error) throw error;

  return data;
};

// Annuler une rÃ©servation
const cancelReservation = async (reservationId) => {
  return updateReservation(reservationId, { statut: 'annulee' });
};

// Confirmer une rÃ©servation
const confirmReservation = async (reservationId) => {
  return updateReservation(reservationId, { statut: 'confirmee' });
};

// Marquer une rÃ©servation comme terminÃ©e
const completeReservation = async (reservationId) => {
  return updateReservation(reservationId, { statut: 'terminee' });
};

// Supprimer une rÃ©servation
const deleteReservation = async (reservationId) => {
  const { error } = await db
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

