const express = require('express');
const router = express.Router();
const especeController = require('../controllers/especeController');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/requireAdmin');

// Consultation (accessible connecté)
router.get('/', authenticateToken, especeController.getAllEspeces);
router.get('/:id', authenticateToken, especeController.getEspece);

// Gestion administrative
router.post('/', authenticateToken, requireAdmin, especeController.createEspece);
router.patch('/:id', authenticateToken, requireAdmin, especeController.updateEspece);
router.delete('/:id', authenticateToken, requireAdmin, especeController.deleteEspece);

module.exports = router;
