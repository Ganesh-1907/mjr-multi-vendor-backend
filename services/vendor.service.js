const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
const { AppError } = require('./auth.service');

const getVendorById = async (idOrSlug) => {
  const vendor = await Vendor.findOne({
    $or: [{ _id: idOrSlug }, { storeSlug: idOrSlug }],
  }).populate('user', 'firstName lastName email phone avatar').lean();

  if (!vendor) throw new AppError('Vendor not found', 404);
  return vendor;
};

const getAllVendors = async () => {
  return Vendor.find({ isVerified: true })
    .populate('user', 'firstName lastName email phone avatar')
    .sort({ rating: -1 })
    .lean();
};

const getVendorStats = async (vendorUserId) => {
  const vendor = await Vendor.findOne({ user: vendorUserId });
  if (!vendor) throw new AppError('Vendor profile not found');

  const totalProducts = await Product.countDocuments({ vendor: vendor._id });
  const activeProducts = await Product.countDocuments({ vendor: vendor._id, status: 'APPROVED' });
  const pendingProducts = await Product.countDocuments({ vendor: vendor._id, status: 'PENDING' });

  const OrderItem = require('../models/OrderItem');
  const Order = require('../models/Order');
  const vendorOrderItems = await OrderItem.find({ vendor: vendor._id });
  const totalSales = vendorOrderItems.reduce((sum, item) => sum + item.totalPrice, 0);

  return {
    totalProducts,
    activeProducts,
    pendingProducts,
    totalSales,
    rating: vendor.rating,
    totalReviews: vendorOrderItems.length,
  };
};

const updateVendorProfile = async (userId, updates) => {
  const vendor = await Vendor.findOne({ user: userId });
  if (!vendor) throw new AppError('Vendor profile not found');

  const allowedFields = ['storeName', 'storeDescription', 'storeLogo', 'storeBanner',
    'businessEmail', 'businessPhone', 'gstNumber', 'panNumber',
    'bankAccountNo', 'bankIfsc', 'bankName', 'address'];

  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) {
      vendor[field] = updates[field];
    }
  });

  // Also update user fields
  if (updates.firstName || updates.lastName || updates.phone) {
    const userFields = {};
    if (updates.firstName) userFields.firstName = updates.firstName;
    if (updates.lastName) userFields.lastName = updates.lastName;
    if (updates.phone) userFields.phone = updates.phone;
    await User.findByIdAndUpdate(userId, userFields);
  }

  await vendor.save();
  return vendor.populate('user', 'firstName lastName email phone avatar');
};

const verifyVendor = async (vendorId) => {
  const vendor = await Vendor.findByIdAndUpdate(vendorId, { isVerified: true }, { new: true });
  if (!vendor) throw new AppError('Vendor not found', 404);
  return vendor;
};

module.exports = { getVendorById, getAllVendors, getVendorStats, updateVendorProfile, verifyVendor };
