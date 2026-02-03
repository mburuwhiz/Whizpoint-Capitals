const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);
router.use(adminOnly);

router.get('/admin', adminController.getDashboard);
router.get('/admin/users', adminController.getUsers);
router.get('/admin/users/:id', adminController.getUserDetails);
router.post('/admin/adjust-balance', adminController.adjustBalance);
router.get('/admin/verifications', adminController.getVerifications);
router.post('/admin/verifications/:id/approve', adminController.approveVerification);
router.post('/admin/verifications/:id/reject', adminController.rejectVerification);
router.get('/admin/logs', adminController.getLogs);

router.post('/admin/users/:id/toggle-freeze', adminController.toggleFreeze);
router.get('/admin/disputes', adminController.getDisputes);
router.post('/admin/disputes/:id/resolve', adminController.resolveDispute);

module.exports = router;
