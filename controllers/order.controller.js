const orderService = require('../services/order.service');
const ApiResponse = require('../utils/ApiResponse');

const placeOrder = async (req, res, next) => {
  try {
    const order = await orderService.placeOrder(req.user.userId, req.body);
    res.json(ApiResponse.success(order, 'Order placed successfully'));
  } catch (error) {
    next(error);
  }
};

const getUserOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getUserOrders(req.user.userId);
    res.json(ApiResponse.success(orders));
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.orderId);
    // Check ownership
    if (order.user.toString() !== req.user.userId && req.user.role !== 'ADMIN') {
      return res.status(403).json(ApiResponse.error('Not authorized'));
    }
    res.json(ApiResponse.success(order));
  } catch (error) {
    next(error);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const order = await orderService.cancelOrder(req.params.orderId, req.user.userId);
    res.json(ApiResponse.success(order, 'Order cancelled'));
  } catch (error) {
    next(error);
  }
};

const getOrderTracking = async (req, res, next) => {
  try {
    const tracking = await orderService.getOrderTracking(req.params.orderId);
    res.json(ApiResponse.success(tracking));
  } catch (error) {
    next(error);
  }
};

module.exports = { placeOrder, getUserOrders, getOrderById, cancelOrder, getOrderTracking };
