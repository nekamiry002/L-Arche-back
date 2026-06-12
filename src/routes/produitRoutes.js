const express = require('express');
const router = express.Router();
const c = require('../controllers/produitController');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/requireAdmin');

// Lecture publique (boutique)
router.get('/', c.listProduits);
router.get('/:id', c.getProduit);

// Écriture réservée aux admins
router.post('/', authenticateToken, requireAdmin, c.createProduit);
router.patch('/:id', authenticateToken, requireAdmin, c.updateProduit);
router.delete('/:id', authenticateToken, requireAdmin, c.deleteProduit);

module.exports = router;
