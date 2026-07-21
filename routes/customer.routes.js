const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/role.middleware');

router.use(authenticate, restrictTo('CUSTOMER'));

router.get('/dashboard', customerController.getDashboard);
router.get('/orders', customerController.getOrders);
router.get('/wishlist', customerController.getWishlist);

module.exports = router;
