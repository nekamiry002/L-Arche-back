const { supabase } = require('../config/supabase');
const { NotFoundError } = require('../utils/errorHandler');

// Récupérer une info espèce/race par ID
const getEspeceInfoById = async (id) => {
  const { data, error } = await supabase
    .from('especes_infos')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    throw new NotFoundError('EspeceInfo', id);
  }

  return data;
};

// Récupérer toutes les espèces/races
const getAllEspecesInfos = async (limit = 100, offset = 0) => {
  const { data, error, count } = await supabase
    .from('especes_infos')
    .select('*', { count: 'exact' })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return { data, total: count };
};

// Créer une info espèce/race
const createEspeceInfo = async (especeData) => {
  const { data, error } = await supabase
    .from('especes_infos')
    .insert([
      {
        nom: especeData.nom,
        categorie: especeData.categorie || null,
        description: especeData.description || null,
        besoins: especeData.besoins || null,
        conseils: especeData.conseils || null,
        image_url: especeData.image_url || null,
        a_savoir: especeData.a_savoir || null,
        race: especeData.race || false,
        espece_parente: especeData.espece_parente || null,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return data;
};

// Mettre à jour une info espèce/race
const updateEspeceInfo = async (id, updates) => {
  const { data, error } = await supabase
    .from('especes_infos')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return data;
};

// Supprimer une info espèce/race
const deleteEspeceInfo = async (id) => {
  const { error } = await supabase
    .from('especes_infos')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

module.exports = {
  getEspeceInfoById,
  getAllEspecesInfos,
  createEspeceInfo,
  updateEspeceInfo,
  deleteEspeceInfo,
};
