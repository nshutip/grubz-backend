const Stripe = require('stripe');
const { Payment, Order } = require('../models');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.initiateStripeSession = async (order) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: order.customer?.email, // optional
    line_items: [{
      price_data: {
        currency: 'kes',
        unit_amount: parseInt(order.total_price * 100), // in cents
        product_data: {
          name: `Order #${order.id} - Grubz`
        }
      },
      quantity: 1
    }],
    metadata: {
      orderId: order.id
    },
    success_url: process.env.STRIPE_SUCCESS_URL + '?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: process.env.STRIPE_CANCEL_URL
  });

  return session;
};

// Handle webhook
exports.handleStripeWebhook = async (session) => {
  const orderId = session.metadata.orderId;

  await Payment.update({
    status: 'success',
    transaction_id: session.payment_intent,
    paid_at: new Date()
  }, {
    where: { orderId }
  });

  // Update order payment status
  await Order.update({
    payment_status: 'paid'
  }, {
    where: { id: orderId }
  });

  console.log(`Stripe payment successful for order ${orderId}`);
};
