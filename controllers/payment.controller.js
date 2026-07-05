const razorpayService = require('../services/razorpay.service');
const ApiResponse = require('../utils/ApiResponse');

const createOrder = async (req, res, next) => {
  try {
    const { amount, currency, receipt } = req.body;
    const order = await razorpayService.createOrder(amount, currency, receipt);
    res.json(ApiResponse.success(order));
  } catch (error) {
    next(error);
  }
};

const verifyPayment = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const verified = razorpayService.verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    res.json(ApiResponse.success({ verified }));
  } catch (error) {
    next(error);
  }
};

const getKey = async (req, res, next) => {
  try {
    const key = razorpayService.getKeyId();
    res.json(ApiResponse.success(key));
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, verifyPayment, getKey };
