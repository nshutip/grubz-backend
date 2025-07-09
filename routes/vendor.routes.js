const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendor.controller');
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

router.use(authenticate);

// Vendor-only routes
router.get('/me', authorize(['vendor']), vendorController.getVendorProfile);
router.put('/me', authorize(['vendor']), vendorController.updateVendorProfile);
router.get('/me/orders', authorize(['vendor']), vendorController.getVendorOrders);


// ✅ New menu routes (scoped under /vendors/me/)
router.get('/me/menu', authorize(['vendor']), vendorController.getMyMenu);
router.post('/me/menu', authorize(['vendor']), vendorController.addMenuItem);
router.put('/me/menu/:itemId', authorize(['vendor']), vendorController.updateMenuItem);
router.delete('/me/menu/:itemId', authorize(['vendor']), vendorController.deleteMenuItem);

router.get('/', vendorController.getAllVendors);
router.get('/:id', vendorController.getVendorById);
router.get('/:id/menu', vendorController.getVendorMenu);

module.exports = router;
















