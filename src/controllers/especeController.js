const EspeceInfo = require('../models/EspeceInfo');
const { ApiError } = require('../utils/errorHandler');

// Récupérer toutes les espèces et races (avec option de pagination)
const getAllEspeces = async (req, res, next) => {
  try {
    const { limit, offset } = req.query;
    const result = await EspeceInfo.getAllEspecesInfos(parseInt(limit) || 100, parseInt(offset) || 0);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Récupérer une espèce ou race par ID
const getEspece = async (req, res, next) => {
  try {
    const id = req.params.id;
    const espece = await EspeceInfo.getEspeceInfoById(id);
    res.json(espece);
  } catch (err) {
    next(err);
  }
};

// Créer une espèce ou race (Admin)
const createEspece = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      throw new ApiError('Accès refusé. Administrateurs uniquement.', 403);
    }

    const { nom, categorie, description, besoins, conseils, image_url, a_savoir, race, espece_parente } = req.body;
    if (!nom) {
      throw new ApiError('Le nom de l\'espèce ou de la race est obligatoire', 400);
    }

    const newEspece = await EspeceInfo.createEspeceInfo({
      nom,
      categorie,
      description,
      besoins,
      conseils,
      image_url,
      a_savoir,
      race,
      espece_parente
    });

    res.status(201).json(newEspece);
  } catch (err) {
    next(err);
  }
};

// Modifier une espèce ou race (Admin)
const updateEspece = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      throw new ApiError('Accès refusé. Administrateurs uniquement.', 403);
    }

    const id = req.params.id;
    const allowedUpdates = ['nom', 'categorie', 'description', 'besoins', 'conseils', 'image_url', 'a_savoir', 'race', 'espece_parente'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    if (Object.keys(updates).length === 0) {
      throw new ApiError('Aucun champ valide à mettre à jour', 400);
    }

    const updatedEspece = await EspeceInfo.updateEspeceInfo(id, updates);
    res.json(updatedEspece);
  } catch (err) {
    next(err);
  }
};

// Supprimer une espèce ou race (Admin)
const deleteEspece = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      throw new ApiError('Accès refusé. Administrateurs uniquement.', 403);
    }

    const id = req.params.id;
    await EspeceInfo.deleteEspeceInfo(id);
    res.json({ message: 'Espèce/Race supprimée avec succès' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllEspeces,
  getEspece,
  createEspece,
  updateEspece,
  deleteEspece
};
