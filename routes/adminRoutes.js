const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/admin', protect, adminOnly, adminController.getDashboard);
router.get('/admin/users', protect, adminOnly, adminController.getUsers);
router.get('/admin/users/:id', protect, adminOnly, adminController.getUserDetails);
router.post('/admin/adjust-balance', protect, adminOnly, adminController.adjustBalance);
router.get('/admin/verifications', protect, adminOnly, adminController.getVerifications);
router.post('/admin/verifications/:id/approve', protect, adminOnly, adminController.approveVerification);
router.post('/admin/verifications/:id/reject', protect, adminOnly, adminController.rejectVerification);
router.get('/admin/logs', protect, adminOnly, adminController.getLogs);

router.post('/admin/users/:id/toggle-freeze', protect, adminOnly, adminController.toggleFreeze);
router.get('/admin/disputes', protect, adminOnly, adminController.getDisputes);
router.post('/admin/disputes/:id/resolve', protect, adminOnly, adminController.resolveDispute);

module.exports = router;
