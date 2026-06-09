const { supabase } = require('../config/supabase');
const { NotFoundError } = require('../utils/errorHandler');

const STATUTS = ['ouvert', 'traite', 'ferme'];

const getSignalementById = async (id) => {
  const { data, error } = await supabase
    .from('signalements')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) throw new NotFoundError('Signalement', id);
  return data;
};

const getSignalementsBySignaleur = async (signaleurId, limit = 50, offset = 0) => {
  const { data, error, count } = await supabase
    .from('signalements')
    .select('*', { count: 'exact' })
    .eq('signaleur_id', signaleurId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return { data, total: count };
};

const getAllSignalements = async (limit = 50, offset = 0, statut = null) => {
  let query = supabase
    .from('signalements')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (statut) query = query.eq('statut', statut);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, total: count };
};

const createSignalement = async (sig) => {
  const { data, error } = await supabase
    .from('signalements')
    .insert([{
      signaleur_id: sig.signaleur_id,
      signale_id: sig.signale_id,
      raison: sig.raison,
      description: sig.description || null,
      preuve_url: sig.preuve_url || null,
      statut: 'ouvert',
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

const updateStatut = async (id, statut) => {
  const { data, error } = await supabase
    .from('signalements')
    .update({ statut })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

module.exports = { getSignalementById, getSignalementsBySignaleur, getAllSignalements, createSignalement, updateStatut, STATUTS };
