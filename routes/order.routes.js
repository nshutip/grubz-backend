const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const orderController = require('../controllers/order.controller');

router.use(authenticate);

// Customer-only routes
router.post('/', authorize(['customer']), orderController.placeOrder);
router.get('/my', authorize(['customer']), orderController.getMyOrders);

// Shared by vendor and customer (scoped inside controller)
router.get('/:id', authorize(['customer', 'vendor']), orderController.getOrderById);

module.exports = router;
