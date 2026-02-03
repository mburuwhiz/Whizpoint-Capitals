const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/dashboard', protect, userController.getDashboard);
router.get('/profile', protect, userController.getProfile);
router.post('/profile', protect, userController.updateProfile);
router.get('/profile/notifications', protect, userController.getNotifications);
router.post('/profile/notifications', protect, userController.updateNotifications);
router.get('/profile/disputes', protect, userController.getDisputes);
router.post('/profile/disputes', protect, userController.postDispute);

module.exports = router;
