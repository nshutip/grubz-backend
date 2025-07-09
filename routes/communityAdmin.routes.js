const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const communityAdminController = require('../controllers/communityAdmin.controller');

router.use(authenticate, authorize(['community_admin']));

router.get('/vendors', communityAdminController.getVendorsInCommunity);
router.put('/vendors/:vendorId/approve', communityAdminController.approveVendor);
router.get('/stats', communityAdminController.getCommunityStats);

module.exports = router;
