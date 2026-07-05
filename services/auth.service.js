const Role = require('../models/Role');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const { generateToken } = require('../utils/jwt');
const { sendOtpEmail } = require('../utils/email');
const { generateUniqueSlug } = require('../utils/slugify');
const ApiResponse = require('../utils/ApiResponse');
const bcrypt = require('bcryptjs');
const { nanoid } = require('nanoid');

class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
const OTP_EXPIRY = 10 * 60 * 1000; // 10 minutes

const login = async (email, password, role) => {
  const user = await User.findOne({ email }).populate('role');
  if (!user) throw new AppError('Invalid email or password');

  if (!user.isActive) throw new AppError('Account is deactivated. Contact support.');

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) throw new AppError('Invalid email or password');

  // Check role
  const userRole = user.role.name.toUpperCase();
  if (role && role.toUpperCase() !== userRole) throw new AppError(`Invalid role. You are registered as ${userRole}`);

  // For vendor role, check if vendor is verified
  if (userRole === 'VENDOR') {
    const vendor = await Vendor.findOne({ user: user._id });
    if (vendor && !vendor.isVerified) throw new AppError('VENDOR_PENDING_APPROVAL');
  }

  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user._id, userRole);

  return {
    token,
    userId: user._id,
    email: user.email,
    role: userRole,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
  };
};

const sendSignupOtp = async (email, role) => {
  const existingUser = await User.findOne({ email });
  if (existingUser && existingUser.emailVerified) throw new AppError('Email already registered');

  const otp = generateOtp();

  if (existingUser) {
    existingUser.verificationOtp = otp;
    existingUser.otpExpiry = new Date(Date.now() + OTP_EXPIRY);
    await existingUser.save();
  } else {
    const roleDoc = await Role.findOne({ name: role.toUpperCase() });
    if (!roleDoc) throw new AppError('Invalid role');

    await User.create({
      email,
      passwordHash: 'temp-password',
      firstName: '',
      lastName: '',
      role: roleDoc._id,
      verificationOtp: otp,
      otpExpiry: new Date(Date.now() + OTP_EXPIRY),
    });
  }

  await sendOtpEmail(email, otp, 'signup');
};

const resendOtp = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new AppError('Email not found');

  if (user.emailVerified) throw new AppError('Email already verified');

  const otp = generateOtp();
  user.verificationOtp = otp;
  user.otpExpiry = new Date(Date.now() + OTP_EXPIRY);
  await user.save();

  await sendOtpEmail(email, otp, 'signup');
};

const verifyOtpAndRegister = async ({ email, password, firstName, lastName, phone, role, otp, storeName }) => {
  const user = await User.findOne({ email }).populate('role');
  if (!user) throw new AppError('Email not found. Please request OTP first.');

  if (user.emailVerified) throw new AppError('Email already registered');

  if (!user.verificationOtp || user.verificationOtp !== otp) throw new AppError('Invalid OTP');
  if (user.otpExpiry && user.otpExpiry < new Date()) throw new AppError('OTP expired. Please request a new one.');

  const roleDoc = await Role.findOne({ name: role.toUpperCase() });
  if (!roleDoc) throw new AppError('Invalid role');

  const passwordHash = await bcrypt.hash(password, 12);

  user.passwordHash = passwordHash;
  user.firstName = firstName;
  user.lastName = lastName;
  user.phone = phone;
  user.role = roleDoc._id;
  user.emailVerified = true;
  user.verificationOtp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  // Create vendor profile if role is VENDOR
  if (role.toUpperCase() === 'VENDOR') {
    const storeSlug = storeName
      ? await generateUniqueSlug(storeName, Vendor)
      : await generateUniqueSlug(`${firstName} ${lastName} Store`, Vendor);

    await Vendor.create({
      user: user._id,
      storeName: storeName || `${firstName}'s Store`,
      storeSlug,
      businessEmail: email,
      businessPhone: phone,
      isVerified: false,
      commissionRate: 10,
    });
  }

  const token = generateToken(user._id, role.toUpperCase());

  return {
    token,
    userId: user._id,
    email: user.email,
    role: role.toUpperCase(),
    firstName: user.firstName,
    lastName: user.lastName,
  };
};

const sendForgotPasswordOtp = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new AppError('No account found with this email');
  if (!user.isActive) throw new AppError('Account is deactivated');

  const otp = generateOtp();
  user.verificationOtp = otp;
  user.otpExpiry = new Date(Date.now() + OTP_EXPIRY);
  await user.save();

  await sendOtpEmail(email, otp, 'forgot');
};

const resetPassword = async (email, otp, newPassword) => {
  const user = await User.findOne({ email });
  if (!user) throw new AppError('No account found with this email');

  if (!user.verificationOtp || user.verificationOtp !== otp) throw new AppError('Invalid OTP');
  if (user.otpExpiry && user.otpExpiry < new Date()) throw new AppError('OTP expired. Please request a new one.');

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  user.verificationOtp = undefined;
  user.otpExpiry = undefined;
  await user.save();
};

module.exports = {
  login,
  sendSignupOtp,
  resendOtp,
  verifyOtpAndRegister,
  sendForgotPasswordOtp,
  resetPassword,
  AppError,
};
