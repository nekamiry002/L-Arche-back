const express = require('express');
const router = express.Router();
const disponibiliteController = require('../controllers/disponibiliteController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/me', disponibiliteController.getMyDisponibilites);
router.get('/:userId', disponibiliteController.getGardienDisponibilites);
router.post('/', disponibiliteController.createDisponibilite);
router.patch('/:id', disponibiliteController.updateDisponibilite);
router.delete('/:id', disponibiliteController.deleteDisponibilite);

module.exports = router;
