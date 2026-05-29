const { ValidationError } = require('./errorHandler');

// Validateurs d'email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
};

// Validateurs de mot de passe
const isValidPassword = (password) => {
  // Minimum 8 caractères, au moins une majuscule, une minuscule et un chiffre
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

// Validateurs de texte
const isValidName = (name) => {
  if (!name || typeof name !== 'string') return false;
  return name.trim().length >= 2 && name.trim().length <= 100;
};

const isValidPhoneNumber = (phone) => {
  if (!phone) return true; // phone est optionnel
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

const isValidCity = (city) => {
  if (!city) return true; // city est optionnel
  return typeof city === 'string' && city.trim().length >= 2 && city.trim().length <= 100;
};

// Validateurs de nombres
const isValidAge = (age) => {
  if (age === null || age === undefined) return true;
  return Number.isInteger(age) && age >= 0 && age <= 150;
};

const isValidWeight = (weight) => {
  if (!weight) return true;
  return typeof weight === 'number' && weight > 0 && weight <= 500;
};

const isValidRating = (rating) => {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
};

// Validateurs de dates
const isValidDate = (date) => {
  if (!date) return false;
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime());
};

const isValidDateRange = (startDate, endDate) => {
  if (!isValidDate(startDate) || !isValidDate(endDate)) return false;
  return new Date(endDate) >= new Date(startDate);
};

// Validateurs de coordonnées GPS
const isValidCoordinates = (lat, lng) => {
  if (lat === null || lat === undefined || lng === null || lng === undefined) return true;
  const validLat = typeof lat === 'number' && lat >= -90 && lat <= 90;
  const validLng = typeof lng === 'number' && lng >= -180 && lng <= 180;
  return validLat && validLng;
};

// Validateurs pour les énumérations
const isValidRole = (role) => {
  return ['utilisateur', 'admin'].includes(role);
};

const isValidReservationStatus = (status) => {
  return ['en_attente', 'confirmee', 'terminee', 'annulee'].includes(status);
};

const isValidJournalEntryType = (type) => {
  return ['photo', 'message', 'statut', 'alerte'].includes(type);
};

const isValidReportStatus = (status) => {
  return ['ouvert', 'traite', 'ferme'].includes(status);
};

const isValidSpecies = (species) => {
  const validSpecies = ['chien', 'chat', 'lapin', 'hamster', 'cochon_inde', 'oiseau', 'reptile', 'autre'];
  return validSpecies.includes(species?.toLowerCase());
};

// Validateurs composés
const validateUserSignup = (email, password, nom) => {
  const errors = {};

  if (!isValidEmail(email)) {
    errors.email = 'Email invalide';
  }

  if (!isValidPassword(password)) {
    errors.password = 'Le mot de passe doit avoir au minimum 8 caractères, une majuscule, une minuscule et un chiffre';
  }

  if (!isValidName(nom)) {
    errors.nom = 'Le nom doit avoir entre 2 et 100 caractères';
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Erreurs de validation', errors);
  }
};

const validateCreateAnimal = (data) => {
  const errors = {};

  if (!isValidName(data.nom)) {
    errors.nom = 'Le nom doit avoir entre 2 et 100 caractères';
  }

  if (!isValidSpecies(data.espece)) {
    errors.espece = 'Espèce invalide';
  }

  if (data.age !== undefined && !isValidAge(data.age)) {
    errors.age = 'Âge doit être entre 0 et 150';
  }

  if (data.poids !== undefined && !isValidWeight(data.poids)) {
    errors.poids = 'Poids doit être positif et <= 500 kg';
  }

  if (data.sexe !== undefined && data.sexe !== null) {
    if (typeof data.sexe !== 'string') {
      errors.sexe = 'Le sexe doit être une chaîne de caractères';
    }
  }

  if (data.infos_veterinaire !== undefined && data.infos_veterinaire !== null) {
    if (typeof data.infos_veterinaire !== 'string') {
      errors.infos_veterinaire = 'Les informations vétérinaires doivent être du texte';
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Erreurs de validation', errors);
  }
};

const validateCreateReservation = (data) => {
  const errors = {};

  if (!isValidDateRange(data.date_debut, data.date_fin)) {
    errors.dates = 'Les dates sont invalides ou la date de fin doit être après la date de début';
  }

  if (data.statut && !isValidReservationStatus(data.statut)) {
    errors.statut = 'Statut de réservation invalide';
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Erreurs de validation', errors);
  }
};

const validateCreateReview = (note, commentaire) => {
  const errors = {};

  if (!isValidRating(note)) {
    errors.note = 'La note doit être entre 1 et 5';
  }

  if (commentaire && typeof commentaire !== 'string') {
    errors.commentaire = 'Le commentaire doit être du texte';
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Erreurs de validation', errors);
  }
};

module.exports = {
  // Validateurs simples
  isValidEmail,
  isValidPassword,
  isValidName,
  isValidPhoneNumber,
  isValidCity,
  isValidAge,
  isValidWeight,
  isValidRating,
  isValidDate,
  isValidDateRange,
  isValidCoordinates,
  isValidRole,
  isValidReservationStatus,
  isValidJournalEntryType,
  isValidReportStatus,
  isValidSpecies,

  // Validateurs composés
  validateUserSignup,
  validateCreateAnimal,
  validateCreateReservation,
  validateCreateReview,
};
