const express = require('express');
const router = express.Router();
const especeController = require('../controllers/especeController');
const { authenticateToken } = require('../middleware/auth');

// Consultation publique (accessible par les utilisateurs connectés)
router.get('/', authenticateToken, especeController.getAllEspeces);
router.get('/:id', authenticateToken, especeController.getEspece);

// Gestion administrative (Admin uniquement)
router.post('/', authenticateToken, especeController.createEspece);
router.patch('/:id', authenticateToken, especeController.updateEspece);
router.delete('/:id', authenticateToken, especeController.deleteEspece);

module.exports = router;
