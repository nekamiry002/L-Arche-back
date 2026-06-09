const Disponibilite = require('../models/Disponibilite');
const { ApiError } = require('../utils/errorHandler');
const { isValidDate, isValidDateRange } = require('../utils/validation');

// GET /api/disponibilites/me
const getMyDisponibilites = async (req, res, next) => {
  try {
    const userId = req.user.sub || req.user.id;
    const { limit, offset } = req.query;
    const result = await Disponibilite.getDisponibilitesByUser(
      userId,
      parseInt(limit) || 50,
      parseInt(offset) || 0
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// GET /api/disponibilites/:userId
const getGardienDisponibilites = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { limit, offset } = req.query;
    const result = await Disponibilite.getDisponibilitesByUser(
      userId,
      parseInt(limit) || 50,
      parseInt(offset) || 0
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// POST /api/disponibilites
const createDisponibilite = async (req, res, next) => {
  try {
    const userId = req.user.sub || req.user.id;
    const { date_debut, date_fin, disponible } = req.body;

    if (!isValidDate(date_debut) || !isValidDate(date_fin)) {
      throw new ApiError('Dates invalides', 400);
    }
    if (!isValidDateRange(date_debut, date_fin)) {
      throw new ApiError('La date de fin doit être après la date de début', 400);
    }

    const dispo = await Disponibilite.createDisponibilite({
      utilisateur_id: userId,
      date_debut,
      date_fin,
      disponible,
    });
    res.status(201).json(dispo);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/disponibilites/:id
const updateDisponibilite = async (req, res, next) => {
  try {
    const userId = req.user.sub || req.user.id;
    const { id } = req.params;

    const existing = await Disponibilite.getDisponibiliteById(id);
    if (existing.utilisateur_id !== userId && req.user.role !== 'admin') {
      throw new ApiError('Non autorisé', 403);
    }

    const allowed = ['date_debut', 'date_fin', 'disponible'];
    const updates = {};
    Object.keys(req.body).forEach(k => {
      if (allowed.includes(k)) updates[k] = req.body[k];
    });

    if (Object.keys(updates).length === 0) {
      throw new ApiError('Aucun champ valide à mettre à jour', 400);
    }

    const updated = await Disponibilite.updateDisponibilite(id, updates);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/disponibilites/:id
const deleteDisponibilite = async (req, res, next) => {
  try {
    const userId = req.user.sub || req.user.id;
    const { id } = req.params;

    const existing = await Disponibilite.getDisponibiliteById(id);
    if (existing.utilisateur_id !== userId && req.user.role !== 'admin') {
      throw new ApiError('Non autorisé', 403);
    }

    await Disponibilite.deleteDisponibilite(id);
    res.json({ message: 'Disponibilité supprimée' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyDisponibilites,
  getGardienDisponibilites,
  createDisponibilite,
  updateDisponibilite,
  deleteDisponibilite,
};
