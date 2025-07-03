const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendor.controller');

router.get('/', vendorController.getAllVendors);
router.get('/:id', vendorController.getVendorById);
router.get('/:id/menu', vendorController.getVendorMenu);

module.exports = router;
