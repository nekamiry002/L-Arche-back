const Animal = require('../models/Animal');
const { validateCreateAnimal } = require('../utils/validation');
const { ApiError, NotFoundError } = require('../utils/errorHandler');
const { supabase } = require('../config/supabase');

// Récupérer les animaux de l'utilisateur connecté
const getMyAnimals = async (req, res, next) => {
  try {
    const userId = req.user.sub || req.user.id;
    const { limit, offset } = req.query;
    const result = await Animal.getAnimalsByOwnerId(userId, parseInt(limit) || 50, parseInt(offset) || 0);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Récupérer un animal spécifique (avec vérification de propriété)
const getAnimal = async (req, res, next) => {
  try {
    const userId = req.user.sub || req.user.id;
    const animalId = req.params.id;
    const animal = await Animal.getAnimalById(animalId);

    // Vérifier que l'utilisateur est le propriétaire ou un admin
    if (animal.proprietaire_id !== userId && req.user.role !== 'admin') {
      throw new ApiError('Vous n\'êtes pas autorisé à accéder à cet animal', 403);
    }

    res.json(animal);
  } catch (err) {
    next(err);
  }
};

// Créer un animal
const createAnimal = async (req, res, next) => {
  try {
    const userId = req.user.sub || req.user.id;
    const animalData = { ...req.body, proprietaire_id: userId };

    validateCreateAnimal(animalData);

    const newAnimal = await Animal.createAnimal(animalData);
    res.status(201).json(newAnimal);
  } catch (err) {
    next(err);
  }
};

// Mettre à jour un animal
const updateAnimal = async (req, res, next) => {
  try {
    const userId = req.user.sub || req.user.id;
    const animalId = req.params.id;

    // Récupérer l'animal pour vérifier la propriété
    const animal = await Animal.getAnimalById(animalId);
    if (animal.proprietaire_id !== userId && req.user.role !== 'admin') {
      throw new ApiError('Vous n\'êtes pas autorisé à modifier cet animal', 403);
    }

    const allowedUpdates = ['nom', 'espece', 'race', 'age', 'poids', 'caractere', 'besoins_specifiques', 'sexe', 'infos_veterinaire'];
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    if (Object.keys(updates).length === 0) {
      throw new ApiError('Aucun champ valide à mettre à jour', 400);
    }

    const updatedAnimal = await Animal.updateAnimal(animalId, updates);
    res.json(updatedAnimal);
  } catch (err) {
    next(err);
  }
};

// Supprimer un animal
const deleteAnimal = async (req, res, next) => {
  try {
    const userId = req.user.sub || req.user.id;
    const animalId = req.params.id;

    // Récupérer l'animal pour vérifier la propriété
    const animal = await Animal.getAnimalById(animalId);
    if (animal.proprietaire_id !== userId && req.user.role !== 'admin') {
      throw new ApiError('Vous n\'êtes pas autorisé à supprimer cet animal', 403);
    }

    await Animal.deleteAnimal(animalId);
    res.json({ message: 'Animal supprimé avec succès' });
  } catch (err) {
    next(err);
  }
};

// Uploader la photo de l'animal vers Supabase Storage
const uploadAnimalPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError('Aucun fichier image fourni', 400);
    }

    const userId = req.user.sub || req.user.id;
    const animalId = req.params.id;

    // Vérifier la propriété de l'animal
    const animal = await Animal.getAnimalById(animalId);
    if (animal.proprietaire_id !== userId && req.user.role !== 'admin') {
      throw new ApiError('Vous n\'êtes pas autorisé à modifier la photo de cet animal', 403);
    }

    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `${userId}/${animalId}_${Date.now()}.${fileExt}`;

    // Upload vers le bucket Supabase Storage "animaux"
    const { data, error } = await supabase.storage
      .from('animaux')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true
      });

    if (error) {
      throw new ApiError(`Erreur lors de l'upload sur Supabase : ${error.message}`, 500);
    }

    // Récupérer l'URL publique de la photo
    const { data: { publicUrl } } = supabase.storage
      .from('animaux')
      .getPublicUrl(fileName);

    // Mettre à jour l'animal avec l'URL de la photo
    const updatedAnimal = await Animal.updateAnimal(animalId, { photo_url: publicUrl });

    res.json({ message: 'Photo uploadée avec succès', publicUrl, animal: updatedAnimal });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyAnimals,
  getAnimal,
  createAnimal,
  updateAnimal,
  deleteAnimal,
  uploadAnimalPhoto
};
