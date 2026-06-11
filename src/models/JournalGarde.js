const { supabase, supabaseAdmin } = require('../config/supabase');
const db = supabaseAdmin || supabase;
const { NotFoundError } = require('../utils/errorHandler');

const getEntryById = async (id) => {
  const { data, error } = await db
    .from('journaux_garde')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) throw new NotFoundError('Entrée journal', id);
  return data;
};

const getEntriesByReservation = async (reservationId, limit = 100, offset = 0) => {
  const { data, error, count } = await db
    .from('journaux_garde')
    .select('*', { count: 'exact' })
    .eq('reservation_id', reservationId)
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return { data, total: count };
};

const createEntry = async (entry) => {
  const { data, error } = await db
    .from('journaux_garde')
    .insert([{
      reservation_id: entry.reservation_id,
      auteur_id: entry.auteur_id,
      type_entree: entry.type_entree,
      contenu: entry.contenu || null,
      media_url: entry.media_url || null,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

const deleteEntry = async (id) => {
  const { error } = await db
    .from('journaux_garde')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

module.exports = { getEntryById, getEntriesByReservation, createEntry, deleteEntry };

