const express = require('express');
const router = express.Router();
const signalementController = require('../controllers/signalementController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.post('/', signalementController.createSignalement);
router.get('/me', signalementController.getMySignalements);
router.get('/', signalementController.getAllSignalements);
router.patch('/:id', signalementController.updateStatut);

module.exports = router;
