const axios = require('axios');
const moment = require('moment');
const { Payment, Order } = require('../models');
const { INTEGER } = require('sequelize');

const mpesa = {
  consumerKey: process.env.MPESA_CONSUMER_KEY,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET,
  shortcode: process.env.MPESA_SHORTCODE,
  passkey: process.env.MPESA_PASSKEY,
  callbackUrl: process.env.MPESA_CALLBACK_URL,
  baseUrl: 'https://sandbox.safaricom.co.ke'
};

// Get OAuth token
async function getToken() {
  const { consumerKey, consumerSecret, baseUrl } = mpesa;
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  const res = await axios.get(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` }
  });

  return res.data.access_token;
}

// Initiate STK Push
exports.initiateMpesa = async (phone, total_price, orderId) => {
  const token = await getToken();


  const timestamp = moment().format('YYYYMMDDHHmmss');
  const password = Buffer.from(`${mpesa.shortcode}${mpesa.passkey}${timestamp}`).toString('base64');

  const body = {
    BusinessShortCode: parseInt(mpesa.shortcode),
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: parseInt(total_price),
    PartyA: parseInt(formatPhone(phone)),
    PartyB: parseInt(mpesa.shortcode),
    PhoneNumber: parseInt(formatPhone(phone)),
    CallBackURL: mpesa.callbackUrl,
    AccountReference: `GRUBZ-${orderId}`,
    TransactionDesc: 'Food Order'
  };

  console.log(body);
  console.log(token);
  console.log(mpesa.baseUrl);

  const res = await axios.post(`${mpesa.baseUrl}/mpesa/stkpush/v1/processrequest`, body, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  return res.data;
};

// Format Kenyan phone numbers to 2547XXXXXXXX
function formatPhone(phone) {
  if (phone.startsWith('+')) return phone.replace('+', '');
  if (phone.startsWith('0')) return `254${phone.substring(1)}`;
  return phone;
}

// Handle M-Pesa Callback
exports.handleMpesaCallback = async (result) => {
  const stkCallback = result.Body.stkCallback;

  const metadata = stkCallback.CallbackMetadata?.Item || [];
  const mpesaReceipt = metadata.find(item => item.Name === 'MpesaReceiptNumber')?.Value;
  const paidAmount = metadata.find(item => item.Name === 'Amount')?.Value;
  const paidPhone = metadata.find(item => item.Name === 'PhoneNumber')?.Value;

  if (stkCallback.ResultCode === 0) {
    const orderId = parseOrderId(stkCallback.MerchantRequestID || stkCallback.CheckoutRequestID);

    if (orderId) {
      // Update payment record
      await Payment.update({
        status: 'success',
        transaction_id: mpesaReceipt,
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

      console.log(`Payment success for Order #${orderId}`);
    } else {
      console.log('Could not parse order ID from callback');
    }
  } else {
    console.log(`Payment failed: ${stkCallback.ResultDesc}`);
    
    // Try to update payment status to failed if we can parse the order ID
    const orderId = parseOrderId(stkCallback.MerchantRequestID || stkCallback.CheckoutRequestID);
    if (orderId) {
      await Payment.update({
        status: 'failed',
        paid_at: new Date()
      }, {
        where: { orderId }
      });

      await Order.update({
        payment_status: 'failed'
      }, {
        where: { id: orderId }
      });
    }
  }
};

// Helper to parse orderId (optional - depends on how you structure reference/account)
function parseOrderId(ref) {
  const match = /GRUBZ-(\d+)/.exec(ref);
  return match ? parseInt(match[1]) : null;
};
