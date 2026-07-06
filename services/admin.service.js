const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Category = require('../models/Category');
const Banner = require('../models/Banner');
const Coupon = require('../models/Coupon');
const SupportTicket = require('../models/SupportTicket');
const ContactMessage = require('../models/ContactMessage');
const { AppError } = require('./auth.service');
const bcrypt = require('bcryptjs');
const { nanoid } = require('nanoid');
const { sendVendorApprovalEmail, sendVendorRejectionEmail, sendVendorCredentialsEmail } = require('../utils/email');

const getDashboardStats = async () => {
  const Role = require('../models/Role');
  const customerRole = await Role.findOne({ name: 'CUSTOMER' });
  const vendorRole = await Role.findOne({ name: 'VENDOR' });

  const [
    totalOrders,
    totalProducts,
    totalVendors,
    totalCustomers,
    totalRevenue,
    pendingProducts,
    pendingVendors,
    openTickets,
  ] = await Promise.all([
    Order.countDocuments(),
    Product.countDocuments({ status: { $ne: 'DRAFT' } }),
    User.countDocuments({ role: vendorRole?._id }),
    User.countDocuments({ role: customerRole?._id }),
    OrderItem.aggregate([
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
    Product.countDocuments({ status: 'PENDING' }),
    Vendor.countDocuments({ isVerified: false }),
    SupportTicket.countDocuments({ status: { $in: ['OPEN', 'IN_PROGRESS'] } }),
  ]);

  const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

  // Recent orders
  const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).lean();

  // Monthly revenue for chart (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const monthlyRevData = await OrderItem.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
        total: { $sum: '$totalPrice' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Initialize last 6 months with 0
  const monthlyRevenue = [];
  let maxMonthlyRev = 0;
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    monthlyRevenue.push({
      name: monthNames[d.getMonth()],
      month: d.getMonth() + 1,
      year: d.getFullYear(),
      total: 0,
      percentage: 0
    });
  }

  // Populate actuals
  monthlyRevData.forEach(item => {
    const monthRecord = monthlyRevenue.find(m => m.month === item._id.month && m.year === item._id.year);
    if (monthRecord) {
      monthRecord.total = item.total;
      if (item.total > maxMonthlyRev) maxMonthlyRev = item.total;
    }
  });

  // Calculate percentages for bars
  if (maxMonthlyRev > 0) {
    monthlyRevenue.forEach(m => {
      m.percentage = Math.round((m.total / maxMonthlyRev) * 100);
    });
  }

  return { totalOrders, totalProducts, totalVendors, totalCustomers, totalRevenue: revenue, pendingProducts, pendingVendors, openTickets, recentOrders, monthlyRevenue };
};

const getUsers = async () => {
  const Role = require('../models/Role');
  const customerRole = await Role.findOne({ name: 'CUSTOMER' });
  return User.find({ role: customerRole._id }).sort({ createdAt: -1 }).populate('role', 'name');
};

const updateUserStatus = async (userId, isActive) => {
  const user = await User.findByIdAndUpdate(userId, { isActive }, { new: true });
  if (!user) throw new AppError('User not found', 404);
  return user;
};

const getVendors = async () => {
  return Vendor.find().populate('user', 'firstName lastName email phone isActive').sort({ createdAt: -1 });
};

const getPendingVendors = async () => {
  return Vendor.find({ isVerified: false }).populate('user', 'firstName lastName email phone').sort({ createdAt: -1 });
};

const approveVendor = async (vendorId, adminUserId) => {
  const vendor = await Vendor.findById(vendorId).populate('user');
  if (!vendor) throw new AppError('Vendor not found', 404);

  vendor.isVerified = true;
  await vendor.save();

  await sendVendorApprovalEmail(vendor.user.email, vendor.storeName);
  return vendor;
};

const rejectVendor = async (vendorId, reason, adminUserId) => {
  const vendor = await Vendor.findById(vendorId).populate('user');
  if (!vendor) throw new AppError('Vendor not found', 404);

  // Deactivate the user
  await User.findByIdAndUpdate(vendor.user._id, { isActive: false });

  await sendVendorRejectionEmail(vendor.user.email, vendor.storeName, reason);
  return vendor;
};

const createVendor = async ({ email, storeName, firstName, lastName, phone }, adminUserId) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new AppError('Email already exists');

  const Role = require('../models/Role');
  const vendorRole = await Role.findOne({ name: 'VENDOR' });

  const password = nanoid(10);
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    email,
    passwordHash,
    firstName,
    lastName,
    phone,
    role: vendorRole._id,
    isActive: true,
    emailVerified: true,
  });

  const slug = require('slugify');
  const storeSlug = slug(storeName, { lower: true, strict: true });

  const vendor = await Vendor.create({
    user: user._id,
    storeName,
    storeSlug,
    businessEmail: email,
    businessPhone: phone,
    isVerified: true,
    commissionRate: 10,
  });

  await sendVendorCredentialsEmail(email, password, storeName);

  return { user, vendor, tempPassword: password };
};

const getOrders = async () => {
  return Order.find().populate('user', 'firstName lastName email').sort({ createdAt: -1 }).lean();
};

const updateOrderStatus = async (orderId, status, description, location) => {
  const orderService = require('./order.service');
  return orderService.updateOrderStatus(orderId, status, description, location);
};

module.exports = {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  getVendors,
  getPendingVendors,
  approveVendor,
  rejectVendor,
  createVendor,
  getOrders,
  updateOrderStatus,
};
