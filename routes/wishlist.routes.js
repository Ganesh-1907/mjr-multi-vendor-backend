const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlist.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/', authenticate, wishlistController.getWishlist);
router.post('/:productId', authenticate, wishlistController.addToWishlist);
router.delete('/:productId', authenticate, wishlistController.removeFromWishlist);
router.get('/check/:productId', authenticate, wishlistController.checkWishlist);

module.exports = router;
