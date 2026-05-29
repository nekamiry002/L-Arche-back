const User = require('../models/User');
const { ApiError } = require('../utils/errorHandler');

// Récupérer le profil de l'utilisateur connecté
const getMe = async (req, res, next) => {
  try {
    const userId = req.user.sub || req.user.id;
    const user = await User.getUserById(userId);
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// Mettre à jour son propre profil
const updateMe = async (req, res, next) => {
  try {
    const userId = req.user.sub || req.user.id;

    // Filtrer les champs autorisés pour une auto-mise à jour
    const allowedUpdates = [
      'nom', 'prenom', 'ville', 'telephone', 'avatar_url',
      'description_gardien', 'experience_animaux', 'type_logement',
      'jardin', 'animaux_acceptes', 'latitude', 'longitude', 'est_gardien',
      'description', 'tarif', 'type_de_garde', 'images_logement'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    if (Object.keys(updates).length === 0) {
      throw new ApiError('No valid update fields provided', 400);
    }

    const updatedUser = await User.updateUser(userId, updates);
    res.json(updatedUser);
  } catch (err) {
    next(err);
  }
};

// Vérification de l'identité (Simulé)
const verifyIdentity = async (req, res, next) => {
  try {
    const userId = req.user.sub || req.user.id;
    // Ici on simulerait une logique de vérification (ex: vérification de CNI via service tiers)
    const updatedUser = await User.updateUser(userId, { identite_verifiee: true });
    res.json({ message: 'Identité vérifiée avec succès', user: updatedUser });
  } catch (err) {
    next(err);
  }
};

// Admin: Récupérer tous les utilisateurs
const getAllUsers = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      throw new ApiError('Not authorized', 403);
    }
    const { limit, offset } = req.query;
    const users = await User.getAllUsers(parseInt(limit) || 50, parseInt(offset) || 0);
    res.json(users);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMe,
  updateMe,
  verifyIdentity,
  getAllUsers
};
