const { Order, Payment } = require('../models');
const { initiateMpesa, handleMpesaCallback } = require('../services/mpesa.service');
const { initiateStripeSession, handleStripeWebhook } = require('../services/stripe.service');

const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

exports.initiatePayment = async (req, res) => {
  const { orderId } = req.params;
  const { method, phone } = req.body;
  const user = req.user;

  try {
    const order = await Order.findByPk(orderId, {
      include: [Payment]
    });

    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.customerId !== user.id) return res.status(403).json({ error: 'Unauthorized' });
    if (order.Payment.status === 'success') return res.status(400).json({ error: 'Order already paid' });

    if (method === 'mpesa') {
        console.log(order.total_price);
        console.log(phone)
        const response = await initiateMpesa(phone, order.total_price, order.id);
        console.log(response);
        return res.json({ message: 'STK Push initiated', mpesa: response });
    }

    if (method === 'stripe') {
      const session = await initiateStripeSession(order);
      return res.json({ url: session.url });
    }

    return res.status(400).json({ error: 'Unsupported payment method' });
  } catch (err) {
    console.error('Payment initiation error:', err);
    res.status(500).json({ error: 'Failed to initiate payment' + err});
  }
};

// Mpesa callback
exports.handleMpesaCallback = async (req, res) => {
  try {
    const result = req.body;
    await handleMpesaCallback(result);
    res.status(200).send('OK');
  } catch (err) {
    console.error('Mpesa callback error:', err);
    res.status(500).send('Error processing callback' + err);
  }
};

exports.handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      await handleStripeWebhook(session);
    }
  
    res.status(200).json({ received: true });
};
