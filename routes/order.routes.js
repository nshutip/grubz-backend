const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authenticate = require('../middleware/authMiddleware');

router.post('/', authenticate, orderController.createOrder);
router.get('/:id', authenticate, orderController.getOrderById);

module.exports = router;
