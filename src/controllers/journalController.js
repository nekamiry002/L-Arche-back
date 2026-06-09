const JournalGarde = require('../models/JournalGarde');
const Reservation = require('../models/Reservation');
const { supabase } = require('../config/supabase');
const { ApiError } = require('../utils/errorHandler');
const multer = require('multer');

const TYPES_VALIDES = ['photo', 'message', 'statut', 'alerte'];

// Vérifie que l'utilisateur est propriétaire ou gardien de la réservation
async function checkAccess(reservationId, userId, role) {
  const reservation = await Reservation.getReservationById(reservationId);
  if (reservation.proprietaire_id !== userId && reservation.gardien_id !== userId && role !== 'admin') {
    throw new ApiError('Vous n\'êtes pas autorisé à accéder à ce journal', 403);
  }
  return reservation;
}

// GET /api/journaux/:reservationId
const getJournal = async (req, res, next) => {
  try {
    const userId = req.user.sub || req.user.id;
    const { reservationId } = req.params;
    const { limit, offset } = req.query;

    await checkAccess(reservationId, userId, req.user.role);

    const result = await JournalGarde.getEntriesByReservation(
      reservationId,
      parseInt(limit) || 100,
      parseInt(offset) || 0
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// POST /api/journaux/:reservationId
const addEntry = async (req, res, next) => {
  try {
    const userId = req.user.sub || req.user.id;
    const { reservationId } = req.params;
    const { type_entree, contenu } = req.body;

    const reservation = await checkAccess(reservationId, userId, req.user.role);

    if (reservation.statut !== 'confirmee') {
      throw new ApiError('Le journal n\'est accessible que pour une garde en cours (statut: confirmee)', 400);
    }

    if (!TYPES_VALIDES.includes(type_entree)) {
      throw new ApiError(`type_entree invalide. Valeurs acceptées : ${TYPES_VALIDES.join(', ')}`, 400);
    }

    if (!contenu && type_entree !== 'photo') {
      throw new ApiError('Le contenu est obligatoire pour ce type d\'entrée', 400);
    }

    const entry = await JournalGarde.createEntry({
      reservation_id: reservationId,
      auteur_id: userId,
      type_entree,
      contenu,
    });
    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
};

// POST /api/journaux/:reservationId/upload
const uploadMedia = async (req, res, next) => {
  try {
    if (!req.file) throw new ApiError('Aucun fichier fourni', 400);

    const userId = req.user.sub || req.user.id;
    const { reservationId } = req.params;

    const reservation = await checkAccess(reservationId, userId, req.user.role);
    if (reservation.statut !== 'confirmee') {
      throw new ApiError('Impossible d\'uploader sur une garde non confirmée', 400);
    }

    const ext = req.file.originalname.split('.').pop();
    const fileName = `${reservationId}/${userId}_${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('journaux')
      .upload(fileName, req.file.buffer, { contentType: req.file.mimetype, upsert: true });

    if (uploadError) throw new ApiError(`Upload échoué : ${uploadError.message}`, 500);

    const { data: { publicUrl } } = supabase.storage.from('journaux').getPublicUrl(fileName);

    const entry = await JournalGarde.createEntry({
      reservation_id: reservationId,
      auteur_id: userId,
      type_entree: 'photo',
      contenu: req.body.contenu || null,
      media_url: publicUrl,
    });

    res.status(201).json({ entry, publicUrl });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/journaux/entries/:entryId
const deleteEntry = async (req, res, next) => {
  try {
    const userId = req.user.sub || req.user.id;
    const { entryId } = req.params;

    const entry = await JournalGarde.getEntryById(entryId);
    if (entry.auteur_id !== userId && req.user.role !== 'admin') {
      throw new ApiError('Non autorisé', 403);
    }

    await JournalGarde.deleteEntry(entryId);
    res.json({ message: 'Entrée supprimée' });
  } catch (err) {
    next(err);
  }
};

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|webp|gif|mp4)$/i)) {
      return cb(new Error('Format de fichier non supporté'));
    }
    cb(undefined, true);
  }
});

module.exports = { getJournal, addEntry, uploadMedia, deleteEntry, upload };
