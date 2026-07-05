const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/', authenticate, orderController.placeOrder);
router.get('/', authenticate, orderController.getUserOrders);
router.get('/:orderId', authenticate, orderController.getOrderById);
router.post('/:orderId/cancel', authenticate, orderController.cancelOrder);
router.get('/:orderId/tracking', authenticate, orderController.getOrderTracking);

module.exports = router;
