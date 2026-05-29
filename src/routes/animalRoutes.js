const express = require('express');
const router = express.Router();
const animalController = require('../controllers/animalController');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');

// Configuration de multer en mémoire
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5 Mo
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|webp)$/i)) {
      return cb(new Error('Veuillez uploader une image (jpg, jpeg, png, webp)'));
    }
    cb(undefined, true);
  }
});

// Toutes les routes animaux nécessitent d'être connecté
router.use(authenticateToken);

// CRUD Animaux
router.post('/', animalController.createAnimal);
router.get('/', animalController.getMyAnimals);
router.get('/:id', animalController.getAnimal);
router.patch('/:id', animalController.updateAnimal);
router.delete('/:id', animalController.deleteAnimal);

// Upload photo animal
router.post('/:id/upload-photo', upload.single('photo'), animalController.uploadAnimalPhoto);

module.exports = router;
