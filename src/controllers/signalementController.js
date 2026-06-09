const Signalement = require('../models/Signalement');
const { ApiError } = require('../utils/errorHandler');

// POST /api/signalements
const createSignalement = async (req, res, next) => {
  try {
    const userId = req.user.sub || req.user.id;
    const { signale_id, raison, description } = req.body;

    if (!signale_id || !raison) {
      throw new ApiError('signale_id et raison sont obligatoires', 400);
    }

    if (signale_id === userId) {
      throw new ApiError('Vous ne pouvez pas vous signaler vous-même', 400);
    }

    const signalement = await Signalement.createSignalement({
      signaleur_id: userId,
      signale_id,
      raison,
      description,
    });

    res.status(201).json(signalement);
  } catch (err) {
    next(err);
  }
};

// GET /api/signalements/me
const getMySignalements = async (req, res, next) => {
  try {
    const userId = req.user.sub || req.user.id;
    const { limit, offset } = req.query;
    const result = await Signalement.getSignalementsBySignaleur(
      userId,
      parseInt(limit) || 50,
      parseInt(offset) || 0
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// GET /api/signalements — admin uniquement
const getAllSignalements = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') throw new ApiError('Accès réservé aux administrateurs', 403);
    const { limit, offset, statut } = req.query;
    const result = await Signalement.getAllSignalements(
      parseInt(limit) || 50,
      parseInt(offset) || 0,
      statut || null
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/signalements/:id — admin uniquement
const updateStatut = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') throw new ApiError('Accès réservé aux administrateurs', 403);

    const { id } = req.params;
    const { statut } = req.body;

    if (!Signalement.STATUTS.includes(statut)) {
      throw new ApiError(`Statut invalide. Valeurs : ${Signalement.STATUTS.join(', ')}`, 400);
    }

    const updated = await Signalement.updateStatut(id, statut);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

module.exports = { createSignalement, getMySignalements, getAllSignalements, updateStatut };
