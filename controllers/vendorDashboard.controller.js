const productService = require('../services/product.service');
const payoutService = require('../services/payout.service');
const orderService = require('../services/order.service');
const reviewService = require('../services/review.service');
const vendorService = require('../services/vendor.service');
const Vendor = require('../models/Vendor');
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
    const vendor = await Vendor.findOne({ user: req.user.userId });
    if (!vendor) return res.status(400).json(ApiResponse.error('Vendor not found'));

    // Generate last 12 months chronologically
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyRevenue = [];
    
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyRevenue.push({
        month: `${monthNames[d.getMonth()]} '${d.getFullYear().toString().slice(-2)}`, // Formatted as "Jan '26" for chart label
        _id: yearMonth,
        revenue: 0,
        commission: 0,
        orders: 0,
      });
    }

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    // Revenue data
    const revenueResult = await OrderItem.aggregate([
      { $match: { vendor: vendor._id, createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$vendorPayout' },
          commission: { $sum: '$commissionAmount' },
          orders: { $addToSet: '$order' },
        },
      }
    ]);

    revenueResult.forEach((r) => {
      const record = monthlyRevenue.find(m => m._id === r._id);
      if (record) {
        record.revenue = r.revenue;
        record.commission = r.commission;
        record.orders = r.orders.length;
      }
    });

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

const updateProfile = async (req, res, next) => {
  try {
    const profile = await vendorService.updateVendorProfile(req.user.userId, req.body);
    res.json(ApiResponse.success(profile, 'Profile updated'));
  } catch (error) {
    next(error);
  }
};

const getPayouts = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.userId });
    if (!vendor) return res.status(400).json(ApiResponse.error('Vendor not found'));
    
    const payouts = await payoutService.getVendorPayouts(vendor._id);
    res.json(ApiResponse.success(payouts));
  } catch (error) {
    next(error);
  }
};



module.exports = { getDashboard, getVendorProducts, createProduct, updateProduct, deleteProduct, getAnalytics, getReviews, getOrders, updateProfile, getPayouts };
