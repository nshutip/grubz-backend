const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

router.use(authenticate);

router.get('/', customerController.getAllCustomers);
router.get('/:id', customerController.getCustomerById);

router.get('/me/profile', authenticate, authorize(['customer']), customerController.getProfile);
router.put('/me/profile', authenticate, authorize(['customer']), customerController.updateProfile);
router.get('/me/orders', authenticate, authorize(['customer']), customerController.getOrders);

module.exports = router
