const productService = require('../services/product.service');
const categoryService = require('../services/category.service');
const bannerService = require('../services/banner.service');
const couponService = require('../services/coupon.service');
const vendorService = require('../services/vendor.service');
const ContactMessage = require('../models/ContactMessage');
const ApiResponse = require('../utils/ApiResponse');

const getHomeData = async (req, res, next) => {
  try {
    const [featuredResult, trendingProducts, activeBanners, activeCategories, coupons] = await Promise.all([
      productService.getFeaturedProducts(),
      productService.getTrendingProducts(),
      bannerService.getActiveBanners(),
      categoryService.getAllCategories(true),
      couponService.getActiveCoupons(),
    ]);

    const featuredProducts = featuredResult.products || featuredResult;

    res.json(ApiResponse.success({
      featuredProducts,
      trendingProducts,
      activeBanners,
      activeCategories,
      coupons,
    }));
  } catch (error) {
    next(error);
  }
};

const searchProducts = async (req, res, next) => {
  try {
    const result = await productService.getProducts(req.query);
    res.json(ApiResponse.success(result));
  } catch (error) {
    next(error);
  }
};

const searchVendors = async (req, res, next) => {
  try {
    const { q } = req.query;
    const Vendor = require('../models/Vendor');
    const vendors = await Vendor.find({
      isVerified: true,
      storeName: { $regex: q || '', $options: 'i' },
    }).populate('user', 'firstName lastName').lean();
    res.json(ApiResponse.success(vendors));
  } catch (error) {
    next(error);
  }
};

const validateCoupon = async (req, res, next) => {
  try {
    const { code, amount } = req.query;
    const result = await couponService.validateCoupon(code, parseFloat(amount));
    res.json(ApiResponse.success(result));
  } catch (error) {
    next(error);
  }
};

const getActiveCoupons = async (req, res, next) => {
  try {
    const coupons = await couponService.getActiveCoupons();
    res.json(ApiResponse.success(coupons));
  } catch (error) {
    next(error);
  }
};

const submitContact = async (req, res, next) => {
  try {
    await ContactMessage.create(req.body);
    res.json(ApiResponse.success(null, 'Message sent successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = { getHomeData, searchProducts, searchVendors, validateCoupon, getActiveCoupons, submitContact };
