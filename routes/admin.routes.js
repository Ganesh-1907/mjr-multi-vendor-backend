const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/role.middleware');

router.use(authenticate, restrictTo('ADMIN'));

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// Users
router.get('/users', adminController.getUsers);
router.put('/users/:userId/status', adminController.updateUserStatus);

// Vendors
router.get('/vendors', adminController.getVendors);
router.get('/vendors/pending', adminController.getPendingVendors);
router.put('/vendors/:vendorId/approve', adminController.approveVendor);
router.put('/vendors/:vendorId/reject', adminController.rejectVendor);
router.post('/vendors/create', adminController.createVendor);

// Products
router.get('/products', adminController.getAllProducts);
router.get('/products/pending', adminController.getPendingProducts);
router.post('/products', adminController.createProduct);
router.put('/products/:productId', adminController.updateProduct);
router.delete('/products/:productId', adminController.deleteProduct);
router.put('/products/:productId/approve', adminController.approveProduct);
router.put('/products/:productId/reject', adminController.rejectProduct);

// Orders
router.get('/orders', adminController.getOrders);
router.put('/orders/:orderId/status', adminController.updateOrderStatus);

// Categories
router.get('/categories', adminController.getAllCategories);
router.post('/categories', adminController.createCategory);
router.put('/categories/:categoryId', adminController.updateCategory);
router.delete('/categories/:categoryId', adminController.deleteCategory);

// Banners
router.get('/banners', adminController.getBanners);
router.post('/banners', adminController.createBanner);
router.put('/banners/:bannerId', adminController.updateBanner);
router.delete('/banners/:bannerId', adminController.deleteBanner);

// Coupons
router.get('/coupons', adminController.getCoupons);
router.post('/coupons', adminController.createCoupon);
router.put('/coupons/:couponId', adminController.updateCoupon);
router.delete('/coupons/:couponId', adminController.deleteCoupon);

// Support Tickets
router.get('/tickets', adminController.getTickets);
router.put('/tickets/:ticketId/assign', adminController.assignTicket);
router.put('/tickets/:ticketId/status', adminController.updateTicketStatus);

// Contacts
router.get('/contacts', adminController.getContacts);
router.delete('/contacts/:contactId', adminController.deleteContact);

module.exports = router;
