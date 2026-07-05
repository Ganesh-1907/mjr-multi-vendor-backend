const adminService = require('../services/admin.service');
const productService = require('../services/product.service');
const categoryService = require('../services/category.service');
const bannerService = require('../services/banner.service');
const couponService = require('../services/coupon.service');
const supportService = require('../services/support.service');
const payoutService = require('../services/payout.service');
const ContactMessage = require('../models/ContactMessage');
const ApiResponse = require('../utils/ApiResponse');

const getDashboard = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.json(ApiResponse.success(stats));
  } catch (error) {
    next(error);
  }
};

// Users
const getUsers = async (req, res, next) => {
  try {
    const users = await adminService.getUsers();
    res.json(ApiResponse.success(users));
  } catch (error) {
    next(error);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const user = await adminService.updateUserStatus(req.params.userId, req.body.isActive);
    res.json(ApiResponse.success(user, 'User status updated'));
  } catch (error) {
    next(error);
  }
};

// Vendors
const getVendors = async (req, res, next) => {
  try {
    const vendors = await adminService.getVendors();
    res.json(ApiResponse.success(vendors));
  } catch (error) {
    next(error);
  }
};

const getPendingVendors = async (req, res, next) => {
  try {
    const vendors = await adminService.getPendingVendors();
    res.json(ApiResponse.success(vendors));
  } catch (error) {
    next(error);
  }
};

const approveVendor = async (req, res, next) => {
  try {
    const vendor = await adminService.approveVendor(req.params.vendorId, req.user.userId);
    res.json(ApiResponse.success(vendor, 'Vendor approved'));
  } catch (error) {
    next(error);
  }
};

const rejectVendor = async (req, res, next) => {
  try {
    const vendor = await adminService.rejectVendor(req.params.vendorId, req.body.reason, req.user.userId);
    res.json(ApiResponse.success(vendor, 'Vendor rejected'));
  } catch (error) {
    next(error);
  }
};

const createVendor = async (req, res, next) => {
  try {
    const result = await adminService.createVendor(req.body, req.user.userId);
    res.json(ApiResponse.success({ ...result, tempPassword: undefined }, 'Vendor created'));
  } catch (error) {
    next(error);
  }
};

// Products
const getAllProducts = async (req, res, next) => {
  try {
    const products = await productService.getAllProducts();
    res.json(ApiResponse.success(products));
  } catch (error) {
    next(error);
  }
};

const getPendingProducts = async (req, res, next) => {
  try {
    const products = await productService.getPendingProducts();
    res.json(ApiResponse.success(products));
  } catch (error) {
    next(error);
  }
};

const approveProduct = async (req, res, next) => {
  try {
    const product = await productService.approveProduct(req.params.productId);
    res.json(ApiResponse.success(product, 'Product approved'));
  } catch (error) {
    next(error);
  }
};

const rejectProduct = async (req, res, next) => {
  try {
    const product = await productService.rejectProduct(req.params.productId);
    res.json(ApiResponse.success(product, 'Product rejected'));
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const Product = require('../models/Product');
    const product = await productService.createProduct(req.body.vendorUserId, { ...req.body, status: 'APPROVED' });
    res.json(ApiResponse.success(product, 'Product created'));
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  // Admin can update any product - find the vendor user id first
  try {
    const Product = require('../models/Product');
    const Vendor = require('../models/Vendor');
    const product = await Product.findById(req.params.productId).populate('vendor');
    if (!product) return res.status(404).json(ApiResponse.error('Product not found'));

    const vendorUser = await Vendor.findById(product.vendor._id).populate('user');
    const updated = await productService.updateProduct(req.params.productId, vendorUser.user._id, req.body);
    res.json(ApiResponse.success(updated, 'Product updated'));
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const Product = require('../models/Product');
    const Vendor = require('../models/Vendor');
    const product = await Product.findById(req.params.productId).populate('vendor');
    if (!product) return res.status(404).json(ApiResponse.error('Product not found'));

    const vendorUser = await Vendor.findById(product.vendor._id).populate('user');
    await productService.deleteProduct(req.params.productId, vendorUser.user._id);
    res.json(ApiResponse.success(null, 'Product deleted'));
  } catch (error) {
    next(error);
  }
};

// Orders
const getOrders = async (req, res, next) => {
  try {
    const orders = await adminService.getOrders();
    res.json(ApiResponse.success(orders));
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, description, location } = req.body;
    const order = await adminService.updateOrderStatus(req.params.orderId, status, description, location);
    res.json(ApiResponse.success(order, 'Order status updated'));
  } catch (error) {
    next(error);
  }
};

// Categories
const createCategory = async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.body);
    res.json(ApiResponse.success(category, 'Category created'));
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const category = await categoryService.updateCategory(req.params.categoryId, req.body);
    res.json(ApiResponse.success(category, 'Category updated'));
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    await categoryService.deleteCategory(req.params.categoryId);
    res.json(ApiResponse.success(null, 'Category deleted'));
  } catch (error) {
    next(error);
  }
};

// Banners
const getBanners = async (req, res, next) => {
  try {
    const banners = await bannerService.getAllBanners();
    res.json(ApiResponse.success(banners));
  } catch (error) {
    next(error);
  }
};

const createBanner = async (req, res, next) => {
  try {
    const banner = await bannerService.createBanner(req.body);
    res.json(ApiResponse.success(banner, 'Banner created'));
  } catch (error) {
    next(error);
  }
};

const updateBanner = async (req, res, next) => {
  try {
    const banner = await bannerService.updateBanner(req.params.bannerId, req.body);
    res.json(ApiResponse.success(banner, 'Banner updated'));
  } catch (error) {
    next(error);
  }
};

const deleteBanner = async (req, res, next) => {
  try {
    await bannerService.deleteBanner(req.params.bannerId);
    res.json(ApiResponse.success(null, 'Banner deleted'));
  } catch (error) {
    next(error);
  }
};

// Coupons
const getCoupons = async (req, res, next) => {
  try {
    const coupons = await couponService.getAllCoupons();
    res.json(ApiResponse.success(coupons));
  } catch (error) {
    next(error);
  }
};

const createCoupon = async (req, res, next) => {
  try {
    const coupon = await couponService.createCoupon(req.body);
    res.json(ApiResponse.success(coupon, 'Coupon created'));
  } catch (error) {
    next(error);
  }
};

const updateCoupon = async (req, res, next) => {
  try {
    const coupon = await couponService.updateCoupon(req.params.couponId, req.body);
    res.json(ApiResponse.success(coupon, 'Coupon updated'));
  } catch (error) {
    next(error);
  }
};

const deleteCoupon = async (req, res, next) => {
  try {
    await couponService.deleteCoupon(req.params.couponId);
    res.json(ApiResponse.success(null, 'Coupon deleted'));
  } catch (error) {
    next(error);
  }
};

// Support Tickets
const getTickets = async (req, res, next) => {
  try {
    const tickets = await supportService.getAllTickets();
    res.json(ApiResponse.success(tickets));
  } catch (error) {
    next(error);
  }
};

const assignTicket = async (req, res, next) => {
  try {
    const ticket = await supportService.assignTicket(req.params.ticketId, req.user.userId);
    res.json(ApiResponse.success(ticket, 'Ticket assigned'));
  } catch (error) {
    next(error);
  }
};

const updateTicketStatus = async (req, res, next) => {
  try {
    const ticket = await supportService.updateTicketStatus(req.params.ticketId, req.body.status);
    res.json(ApiResponse.success(ticket, 'Ticket status updated'));
  } catch (error) {
    next(error);
  }
};

// Contacts
const getContacts = async (req, res, next) => {
  try {
    const contacts = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(ApiResponse.success(contacts));
  } catch (error) {
    next(error);
  }
};

const deleteContact = async (req, res, next) => {
  try {
    await ContactMessage.findByIdAndDelete(req.params.contactId);
    res.json(ApiResponse.success(null, 'Contact deleted'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard, getUsers, updateUserStatus,
  getVendors, getPendingVendors, approveVendor, rejectVendor, createVendor,
  getAllProducts, getPendingProducts, approveProduct, rejectProduct, createProduct, updateProduct, deleteProduct,
  getOrders, updateOrderStatus,
  createCategory, updateCategory, deleteCategory,
  getBanners, createBanner, updateBanner, deleteBanner,
  getCoupons, createCoupon, updateCoupon, deleteCoupon,
  getTickets, assignTicket, updateTicketStatus,
  getContacts, deleteContact,
};
