const productService = require('../services/product.service');
const orderService = require('../services/order.service');
const reviewService = require('../services/review.service');
const vendorService = require('../services/vendor.service');
const OrderItem = require('../models/OrderItem');
const Order = require('../models/Order');
const Product = require('../models/Product');
const ApiResponse = require('../utils/ApiResponse');

const getDashboard = async (req, res, next) => {
  try {
    const stats = await vendorService.getVendorStats(req.user.userId);
    res.json(ApiResponse.success(stats));
  } catch (error) {
    next(error);
  }
};

const getVendorProducts = async (req, res, next) => {
  try {
    const products = await productService.getVendorProducts(req.user.userId);
    res.json(ApiResponse.success(products));
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.user.userId, req.body);
    res.json(ApiResponse.success(product, 'Product created'));
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.productId, req.user.userId, req.body);
    res.json(ApiResponse.success(product, 'Product updated'));
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.productId, req.user.userId);
    res.json(ApiResponse.success(null, 'Product deleted'));
  } catch (error) {
    next(error);
  }
};

const getAnalytics = async (req, res, next) => {
  try {
    const Vendor = require('../models/Vendor');
    const vendor = await Vendor.findOne({ user: req.user.userId });
    if (!vendor) return res.status(400).json(ApiResponse.error('Vendor not found'));

    // Revenue data
    const revenueResult = await OrderItem.aggregate([
      { $match: { vendor: vendor._id } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$vendorPayout' },
          commission: { $sum: '$commissionAmount' },
          orders: { $addToSet: '$order' },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 6 },
    ]);

    const monthlyRevenue = revenueResult.map((r) => ({
      month: r._id,
      revenue: r.revenue,
      commission: r.commission,
      orders: r.orders.length,
    }));

    // Top products
    const topProducts = await OrderItem.aggregate([
      { $match: { vendor: vendor._id } },
      {
        $group: {
          _id: '$productName',
          totalQuantity: { $sum: '$quantity' },
          totalRevenue: { $sum: '$totalPrice' },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 },
    ]);

    res.json(ApiResponse.success({ monthlyRevenue, topProducts }));
  } catch (error) {
    next(error);
  }
};

const getReviews = async (req, res, next) => {
  try {
    const reviews = await reviewService.getVendorReviews(req.user.userId);
    res.json(ApiResponse.success(reviews));
  } catch (error) {
    next(error);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getVendorOrders(req.user.userId);
    res.json(ApiResponse.success(orders));
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, description, location } = req.body;
    const order = await orderService.getOrderById(req.params.orderId);
    const Vendor = require('../models/Vendor');
    const vendor = await Vendor.findOne({ user: req.user.userId });

    // Verify order contains vendor's items
    const vendorItems = await OrderItem.find({ order: req.params.orderId, vendor: vendor._id });
    if (vendorItems.length === 0) {
      return res.status(403).json(ApiResponse.error('Not authorized'));
    }

    const updated = await orderService.updateOrderStatus(req.params.orderId, status, description, location);
    res.json(ApiResponse.success(updated, 'Order status updated'));
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const profile = await vendorService.updateVendorProfile(req.user.userId, req.body);
    res.json(ApiResponse.success(profile, 'Profile updated'));
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard, getVendorProducts, createProduct, updateProduct, deleteProduct, getAnalytics, getReviews, getOrders, updateOrderStatus, updateProfile };
