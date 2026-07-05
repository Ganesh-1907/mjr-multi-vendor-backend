const express = require('express');
const router = express.Router();
const publicController = require('../controllers/public.controller');

router.get('/home', publicController.getHomeData);
router.get('/search', publicController.searchProducts);
router.get('/vendors/search', publicController.searchVendors);
router.get('/coupons', publicController.getActiveCoupons);
router.get('/coupons/validate', publicController.validateCoupon);
router.post('/contact', publicController.submitContact);

module.exports = router;
