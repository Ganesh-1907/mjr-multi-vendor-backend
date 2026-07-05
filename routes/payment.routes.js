const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');

router.post('/create-order', paymentController.createOrder);
router.post('/verify', paymentController.verifyPayment);
router.get('/key', paymentController.getKey);

module.exports = router;
