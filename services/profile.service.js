const User = require('../models/User');
const Vendor = require('../models/Vendor');
const { AppError } = require('./auth.service');

const getProfile = async (userId) => {
  const user = await User.findById(userId).populate('role', 'name').lean();
  if (!user) throw new AppError('User not found', 404);

  let vendor = null;
  if (user.role.name === 'VENDOR') {
    vendor = await Vendor.findOne({ user: userId }).lean();
  }

  return { ...user, vendor };
};

const updateProfile = async (userId, updates) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);

  const allowedFields = ['firstName', 'lastName', 'phone', 'avatar'];
  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) {
      user[field] = updates[field];
    }
  });

  await user.save();

  // Also update vendor fields if user is a vendor
  if (updates.storeName || updates.storeDescription || updates.storeLogo || updates.storeBanner ||
      updates.businessEmail || updates.businessPhone || updates.gstNumber || updates.panNumber ||
      updates.bankAccountNo || updates.bankIfsc || updates.bankName) {
    const vendor = await Vendor.findOne({ user: userId });
    if (vendor) {
      ['storeName', 'storeDescription', 'storeLogo', 'storeBanner', 'businessEmail',
        'businessPhone', 'gstNumber', 'panNumber', 'bankAccountNo', 'bankIfsc', 'bankName'].forEach((field) => {
        if (updates[field] !== undefined) vendor[field] = updates[field];
      });
      await vendor.save();
    }
  }

  return getProfile(userId);
};

module.exports = { getProfile, updateProfile };
