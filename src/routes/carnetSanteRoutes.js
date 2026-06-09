const express = require('express');
const router = express.Router();
const carnetSanteController = require('../controllers/carnetSanteController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/:animalId', carnetSanteController.getCarnet);
router.post('/:animalId', carnetSanteController.addEntry);
router.post('/:animalId/upload', carnetSanteController.upload.single('document'), carnetSanteController.uploadDocument);
router.delete('/entries/:entryId', carnetSanteController.deleteEntry);

module.exports = router;
