const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { authenticate, optionalAuth } = require('../middleware/auth.middleware');

router.get('/', productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/trending', productController.getTrendingProducts);
router.get('/:slug', productController.getProductBySlug);
router.get('/:productId/related', productController.getRelatedProducts);
router.get('/:productId/reviews', productController.getProductReviews);
router.post('/:productId/reviews', authenticate, productController.addProductReview);

module.exports = router;
