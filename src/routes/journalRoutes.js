const express = require('express');
const router = express.Router();
const journalController = require('../controllers/journalController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/:reservationId', journalController.getJournal);
router.post('/:reservationId', journalController.addEntry);
router.post('/:reservationId/upload', journalController.upload.single('media'), journalController.uploadMedia);
router.delete('/entries/:entryId', journalController.deleteEntry);

module.exports = router;
