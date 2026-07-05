const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorDashboard.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/role.middleware');

router.use(authenticate, restrictTo('VENDOR'));

router.get('/dashboard', vendorController.getDashboard);
router.get('/products', vendorController.getVendorProducts);
router.post('/products', vendorController.createProduct);
router.put('/products/:productId', vendorController.updateProduct);
router.delete('/products/:productId', vendorController.deleteProduct);
router.get('/analytics', vendorController.getAnalytics);
router.get('/reviews', vendorController.getReviews);
router.get('/orders', vendorController.getOrders);
router.put('/orders/:orderId/status', vendorController.updateOrderStatus);
router.put('/profile', vendorController.updateProfile);

module.exports = router;
