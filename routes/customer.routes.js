const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/dashboard', authenticate, customerController.getDashboard);
router.get('/orders', authenticate, customerController.getOrders);
router.get('/wishlist', authenticate, customerController.getWishlist);

module.exports = router;
