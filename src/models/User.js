const { supabase } = require('../config/supabase');
const { NotFoundError, ConflictError } = require('../utils/errorHandler');

// Récupérer un utilisateur par ID
const getUserById = async (userId) => {
  const { data, error } = await supabase
    .from('utilisateurs')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) {
    throw new NotFoundError('Utilisateur', userId);
  }

  return data;
};

// Récupérer tous les utilisateurs
const getAllUsers = async (limit = 50, offset = 0) => {
  const { data, error, count } = await supabase
    .from('utilisateurs')
    .select('*', { count: 'exact' })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return { data, total: count };
};

// Créer un utilisateur (profil après inscription Supabase Auth)
const createUser = async (userId, userData) => {
  const { data, error } = await supabase
    .from('utilisateurs')
    .insert([
      {
        id: userId,
        nom: userData.nom,
        prenom: userData.prenom || null,
        ville: userData.ville || null,
        telephone: userData.telephone || null,
        charte_acceptee: userData.charte_acceptee || false,
        role: userData.role || 'utilisateur',
      },
    ])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new ConflictError('Cet utilisateur existe déjà');
    }
    throw error;
  }

  return data;
};

// Mettre à jour un utilisateur
const updateUser = async (userId, updates) => {
  const { data, error } = await supabase
    .from('utilisateurs')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;

  return data;
};

// Supprimer un utilisateur
const deleteUser = async (userId) => {
  const { error } = await supabase
    .from('utilisateurs')
    .delete()
    .eq('id', userId);

  if (error) throw error;
};

module.exports = {
  getUserById,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
};
