const { supabase, supabaseAdmin } = require('../config/supabase');
const db = supabaseAdmin || supabase;
const { NotFoundError } = require('../utils/errorHandler');

const getDisponibiliteById = async (id) => {
  const { data, error } = await db
    .from('disponibilites')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) throw new NotFoundError('Disponibilité', id);
  return data;
};

const getDisponibilitesByUser = async (userId, limit = 50, offset = 0) => {
  const { data, error, count } = await db
    .from('disponibilites')
    .select('*', { count: 'exact' })
    .eq('utilisateur_id', userId)
    .order('date_debut', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return { data, total: count };
};

const createDisponibilite = async (dispo) => {
  const { data, error } = await db
    .from('disponibilites')
    .insert([{
      utilisateur_id: dispo.utilisateur_id,
      date_debut: dispo.date_debut,
      date_fin: dispo.date_fin,
      disponible: dispo.disponible ?? true,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

const updateDisponibilite = async (id, updates) => {
  const { data, error } = await db
    .from('disponibilites')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

const deleteDisponibilite = async (id) => {
  const { error } = await db
    .from('disponibilites')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

module.exports = {
  getDisponibiliteById,
  getDisponibilitesByUser,
  createDisponibilite,
  updateDisponibilite,
  deleteDisponibilite,
};

