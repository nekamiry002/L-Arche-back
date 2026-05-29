const { supabase } = require('../config/supabase');
const { NotFoundError } = require('../utils/errorHandler');

// Récupérer un animal par ID
const getAnimalById = async (animalId) => {
  const { data, error } = await supabase
    .from('animaux')
    .select('*')
    .eq('id', animalId)
    .single();

  if (error || !data) {
    throw new NotFoundError('Animal', animalId);
  }

  return data;
};

// Récupérer tous les animaux d'un propriétaire
const getAnimalsByOwnerId = async (proprietaireId, limit = 50, offset = 0) => {
  const { data, error, count } = await supabase
    .from('animaux')
    .select('*', { count: 'exact' })
    .eq('proprietaire_id', proprietaireId)
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return { data, total: count };
};

// Créer un animal
const createAnimal = async (animalData) => {
  const { data, error } = await supabase
    .from('animaux')
    .insert([
      {
        proprietaire_id: animalData.proprietaire_id,
        nom: animalData.nom,
        espece: animalData.espece,
        race: animalData.race || null,
        age: animalData.age || null,
        poids: animalData.poids || null,
        caractere: animalData.caractere || null,
        besoins_specifiques: animalData.besoins_specifiques || null,
        photo_url: animalData.photo_url || null,
        sexe: animalData.sexe || null,
        infos_veterinaire: animalData.infos_veterinaire || null,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return data;
};

// Mettre à jour un animal
const updateAnimal = async (animalId, updates) => {
  const { data, error } = await supabase
    .from('animaux')
    .update(updates)
    .eq('id', animalId)
    .select()
    .single();

  if (error) throw error;

  return data;
};

// Supprimer un animal
const deleteAnimal = async (animalId) => {
  const { error } = await supabase
    .from('animaux')
    .delete()
    .eq('id', animalId);

  if (error) throw error;
};

module.exports = {
  getAnimalById,
  getAnimalsByOwnerId,
  createAnimal,
  updateAnimal,
  deleteAnimal,
};
