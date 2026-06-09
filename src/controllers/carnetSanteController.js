const CarnetSante = require('../models/CarnetSante');
const Animal = require('../models/Animal');
const Reservation = require('../models/Reservation');
const { supabase } = require('../config/supabase');
const { ApiError } = require('../utils/errorHandler');
const multer = require('multer');

// Vérifie que l'utilisateur peut accéder au carnet de l'animal
// Accès : propriétaire de l'animal + gardien ayant une garde confirmée sur cet animal
async function checkReadAccess(animalId, userId, role) {
  const animal = await Animal.getAnimalById(animalId);

  if (role === 'admin' || animal.proprietaire_id === userId) return animal;

  // Vérifie si l'utilisateur est gardien avec une garde active sur cet animal
  const { data } = await supabase
    .from('reservations')
    .select('id')
    .eq('animal_id', animalId)
    .eq('gardien_id', userId)
    .eq('statut', 'confirmee')
    .limit(1);

  if (!data || data.length === 0) {
    throw new ApiError('Vous n\'êtes pas autorisé à consulter ce carnet de santé', 403);
  }

  return animal;
}

// GET /api/carnets-sante/:animalId
const getCarnet = async (req, res, next) => {
  try {
    const userId = req.user.sub || req.user.id;
    const { animalId } = req.params;
    const { limit, offset } = req.query;

    await checkReadAccess(animalId, userId, req.user.role);

    const result = await CarnetSante.getEntriesByAnimal(
      animalId,
      parseInt(limit) || 50,
      parseInt(offset) || 0
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// POST /api/carnets-sante/:animalId
const addEntry = async (req, res, next) => {
  try {
    const userId = req.user.sub || req.user.id;
    const { animalId } = req.params;
    const { type_document, date_document, notes } = req.body;

    const animal = await Animal.getAnimalById(animalId);
    if (animal.proprietaire_id !== userId && req.user.role !== 'admin') {
      throw new ApiError('Seul le propriétaire peut ajouter une entrée au carnet de santé', 403);
    }

    if (!CarnetSante.TYPES_DOCUMENT.includes(type_document)) {
      throw new ApiError(`type_document invalide. Valeurs : ${CarnetSante.TYPES_DOCUMENT.join(', ')}`, 400);
    }

    const entry = await CarnetSante.createEntry({ animal_id: animalId, type_document, date_document, notes });
    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
};

// POST /api/carnets-sante/:animalId/upload
const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) throw new ApiError('Aucun fichier fourni', 400);

    const userId = req.user.sub || req.user.id;
    const { animalId } = req.params;
    const { type_document, date_document, notes } = req.body;

    const animal = await Animal.getAnimalById(animalId);
    if (animal.proprietaire_id !== userId && req.user.role !== 'admin') {
      throw new ApiError('Seul le propriétaire peut uploader un document', 403);
    }

    if (!CarnetSante.TYPES_DOCUMENT.includes(type_document)) {
      throw new ApiError(`type_document invalide. Valeurs : ${CarnetSante.TYPES_DOCUMENT.join(', ')}`, 400);
    }

    const ext = req.file.originalname.split('.').pop();
    const fileName = `${animalId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('carnets')
      .upload(fileName, req.file.buffer, { contentType: req.file.mimetype, upsert: true });

    if (uploadError) throw new ApiError(`Upload échoué : ${uploadError.message}`, 500);

    const { data: { publicUrl } } = supabase.storage.from('carnets').getPublicUrl(fileName);

    const entry = await CarnetSante.createEntry({
      animal_id: animalId,
      type_document,
      document_url: publicUrl,
      date_document,
      notes,
    });

    res.status(201).json({ entry, publicUrl });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/carnets-sante/entries/:entryId
const deleteEntry = async (req, res, next) => {
  try {
    const userId = req.user.sub || req.user.id;
    const { entryId } = req.params;

    const entry = await CarnetSante.getEntryById(entryId);
    const animal = await Animal.getAnimalById(entry.animal_id);

    if (animal.proprietaire_id !== userId && req.user.role !== 'admin') {
      throw new ApiError('Non autorisé', 403);
    }

    await CarnetSante.deleteEntry(entryId);
    res.json({ message: 'Entrée supprimée du carnet de santé' });
  } catch (err) {
    next(err);
  }
};

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|webp|pdf)$/i)) {
      return cb(new Error('Format non supporté (jpg, png, webp, pdf)'));
    }
    cb(undefined, true);
  }
});

module.exports = { getCarnet, addEntry, uploadDocument, deleteEntry, upload };
