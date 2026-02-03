const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

router.get('/', publicController.getHome);
router.get('/about', publicController.getAbout);
router.get('/fees', publicController.getFees);
router.get('/terms', publicController.getTerms);
router.get('/privacy', publicController.getPrivacy);

module.exports = router;
