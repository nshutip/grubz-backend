const express = require('express');
const router = express.Router();
const platformAdminController = require('../controllers/platformAdmin.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/authorize');

// All routes below are protected for 'platform_admin'
router.use(authenticateToken, authorizeRoles('platform_admin'));

// Community Management
router.get('/communities', platformAdminController.getAllCommunities);
router.post('/communities', platformAdminController.createCommunity);
router.put('/communities/:id', platformAdminController.updateCommunity);
router.delete('/communities/:id', platformAdminController.deleteCommunity);

// Community Admin Management
router.get('/community-admins', platformAdminController.getAllCommunityAdmins);
router.post('/community-admins', platformAdminController.createCommunityAdmin);
router.put('/community-admins/:id', platformAdminController.updateCommunityAdmin);
router.delete('/community-admins/:id', platformAdminController.deleteCommunityAdmin);

// Platform & Community Stats
router.get('/stats/platform', platformAdminController.getPlatformStats);
router.get('/stats/community/:communityId', platformAdminController.getCommunityStats);

module.exports = router;
