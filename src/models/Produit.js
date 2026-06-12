const { supabase, supabaseAdmin } = require('../config/supabase');
const { NotFoundError } = require('../utils/errorHandler');
const db = supabaseAdmin || supabase;

const getAll = async (categorie = null) => {
  let q = db.from('produits').select('*').order('ordre', { ascending: true });
  if (categorie && categorie !== 'tous') q = q.eq('categorie', categorie);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
};

const getById = async (id) => {
  const { data, error } = await db
    .from('produits').select('*').eq('id', id).single();
  if (error || !data) throw new NotFoundError('Produit', id);
  return data;
};

const create = async (fields) => {
  const { data, error } = await db
    .from('produits').insert([fields]).select().single();
  if (error) throw error;
  return data;
};

const update = async (id, fields) => {
  const { data, error } = await db
    .from('produits')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id).select().single();
  if (error) throw error;
  return data;
};

const remove = async (id) => {
  const { error } = await db.from('produits').delete().eq('id', id);
  if (error) throw error;
};

module.exports = { getAll, getById, create, update, remove };
