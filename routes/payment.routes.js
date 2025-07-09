const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const paymentController = require('../controllers/payment.controller');

// router.use(authenticate);

router.post('/pay/:orderId', authenticate, authorize(['customer']), paymentController.initiatePayment);
router.post('/webhook/stripe', paymentController.handleStripeWebhook);
router.post('/webhook/mpesa', paymentController.handleMpesaCallback);

module.exports = router;