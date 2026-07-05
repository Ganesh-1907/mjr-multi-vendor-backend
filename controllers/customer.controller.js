const orderService = require('../services/order.service');
const wishlistService = require('../services/wishlist.service');
const ApiResponse = require('../utils/ApiResponse');

const getDashboard = async (req, res, next) => {
  try {
    const orders = await orderService.getUserOrders(req.user.userId);
    const wishlist = await wishlistService.getWishlist(req.user.userId);
    res.json(ApiResponse.success({
      recentOrders: orders.slice(0, 5),
      totalOrders: orders.length,
      wishlistCount: wishlist.itemCount,
    }));
  } catch (error) {
    next(error);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getUserOrders(req.user.userId);
    res.json(ApiResponse.success(orders));
  } catch (error) {
    next(error);
  }
};

const getWishlist = async (req, res, next) => {
  try {
    const wishlist = await wishlistService.getWishlist(req.user.userId);
    res.json(ApiResponse.success(wishlist));
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard, getOrders, getWishlist };
