const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/', authenticate, cartController.getCart);
router.post('/items', authenticate, cartController.addToCart);
router.put('/items/:cartItemId', authenticate, cartController.updateCartItem);
router.delete('/items/:cartItemId', authenticate, cartController.removeFromCart);
router.delete('/', authenticate, cartController.clearCart);

module.exports = router;
