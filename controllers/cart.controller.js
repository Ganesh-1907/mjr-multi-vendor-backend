const cartService = require('../services/cart.service');
const ApiResponse = require('../utils/ApiResponse');

const getCart = async (req, res, next) => {
  try {
    const cart = await cartService.getCart(req.user.userId);
    res.json(ApiResponse.success(cart));
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const cart = await cartService.addToCart(req.user.userId, req.body);
    res.json(ApiResponse.success(cart, 'Added to cart'));
  } catch (error) {
    next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const cart = await cartService.updateQuantity(req.user.userId, req.params.cartItemId, req.body.quantity);
    res.json(ApiResponse.success(cart, 'Cart updated'));
  } catch (error) {
    next(error);
  }
};

const removeFromCart = async (req, res, next) => {
  try {
    const cart = await cartService.removeFromCart(req.user.userId, req.params.cartItemId);
    res.json(ApiResponse.success(cart, 'Item removed'));
  } catch (error) {
    next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    await cartService.clearCart(req.user.userId);
    res.json(ApiResponse.success(null, 'Cart cleared'));
  } catch (error) {
    next(error);
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
