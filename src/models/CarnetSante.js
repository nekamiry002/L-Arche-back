const { supabase, supabaseAdmin } = require('../config/supabase');
const db = supabaseAdmin || supabase;
const { NotFoundError } = require('../utils/errorHandler');

const TYPES_DOCUMENT = ['vaccin', 'traitement', 'visite', 'autre'];

const getEntryById = async (id) => {
  const { data, error } = await db
    .from('carnets_sante')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) throw new NotFoundError('Entrée carnet de santé', id);
  return data;
};

const getEntriesByAnimal = async (animalId, limit = 50, offset = 0) => {
  const { data, error, count } = await db
    .from('carnets_sante')
    .select('*', { count: 'exact' })
    .eq('animal_id', animalId)
    .order('date_document', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return { data, total: count };
};

const createEntry = async (entry) => {
  const { data, error } = await db
    .from('carnets_sante')
    .insert([{
      animal_id: entry.animal_id,
      type_document: entry.type_document,
      document_url: entry.document_url || null,
      date_document: entry.date_document || null,
      notes: entry.notes || null,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

const deleteEntry = async (id) => {
  const { error } = await db
    .from('carnets_sante')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

module.exports = { getEntryById, getEntriesByAnimal, createEntry, deleteEntry, TYPES_DOCUMENT };

