const razorpay = require('../config/razorpay');
const crypto = require('crypto');

const createOrder = async (amount, currency = 'INR', receipt = null) => {
  const options = {
    amount: Math.round(amount * 100), // Razorpay expects paise
    currency,
    receipt: receipt || `rcpt_${Date.now()}`,
    payment_capture: 1,
  };

  const order = await razorpay.orders.create(options);
  return {
    id: order.id,
    amount: order.amount,
    currency: order.currency,
    receipt: order.receipt,
    status: order.status,
    keyId: process.env.RAZORPAY_KEY_ID,
  };
};

const verifyPayment = (orderId, paymentId, signature) => {
  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  return expectedSignature === signature;
};

const getKeyId = () => {
  return { keyId: process.env.RAZORPAY_KEY_ID };
};

module.exports = { createOrder, verifyPayment, getKeyId };
