const wishlistService = require('../services/wishlist.service');
const ApiResponse = require('../utils/ApiResponse');

const getWishlist = async (req, res, next) => {
  try {
    const wishlist = await wishlistService.getWishlist(req.user.userId);
    res.json(ApiResponse.success(wishlist));
  } catch (error) {
    next(error);
  }
};

const addToWishlist = async (req, res, next) => {
  try {
    const wishlist = await wishlistService.addToWishlist(req.user.userId, req.params.productId);
    res.json(ApiResponse.success(wishlist, 'Added to wishlist'));
  } catch (error) {
    next(error);
  }
};

const removeFromWishlist = async (req, res, next) => {
  try {
    const wishlist = await wishlistService.removeFromWishlist(req.user.userId, req.params.productId);
    res.json(ApiResponse.success(wishlist, 'Removed from wishlist'));
  } catch (error) {
    next(error);
  }
};

const checkWishlist = async (req, res, next) => {
  try {
    const exists = await wishlistService.isInWishlist(req.user.userId, req.params.productId);
    res.json(ApiResponse.success(exists));
  } catch (error) {
    next(error);
  }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist, checkWishlist };
