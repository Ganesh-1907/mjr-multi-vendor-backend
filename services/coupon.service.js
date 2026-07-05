const Coupon = require('../models/Coupon');
const CouponUsage = require('../models/CouponUsage');
const { AppError } = require('./auth.service');

const validateCoupon = async (code, orderAmount) => {
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  if (!coupon) throw new AppError('Invalid coupon code');
  if (coupon.validFrom > new Date() || coupon.validUntil < new Date()) throw new AppError('Coupon expired');
  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) throw new AppError('Coupon usage limit reached');
  if (orderAmount < coupon.minOrderAmount) throw new AppError(`Minimum order amount of ₹${coupon.minOrderAmount} required`);

  let discountAmount = 0;
  if (coupon.type === 'PERCENTAGE') {
    discountAmount = Math.round((orderAmount * coupon.value) / 100);
    if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
      discountAmount = coupon.maxDiscountAmount;
    }
  } else {
    discountAmount = coupon.value;
  }

  const finalAmount = Math.max(0, orderAmount - discountAmount);

  return {
    coupon: {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minOrderAmount: coupon.minOrderAmount,
      maxDiscountAmount: coupon.maxDiscountAmount,
    },
    discountAmount,
    finalAmount,
  };
};

const getAllCoupons = async () => Coupon.find().sort({ createdAt: -1 });
const getActiveCoupons = async () => Coupon.find({ isActive: true, validFrom: { $lte: new Date() }, validUntil: { $gte: new Date() } });

const createCoupon = async (request) => Coupon.create(request);
const updateCoupon = async (couponId, request) => {
  const coupon = await Coupon.findByIdAndUpdate(couponId, request, { new: true });
  if (!coupon) throw new AppError('Coupon not found', 404);
  return coupon;
};
const deleteCoupon = async (couponId) => {
  const coupon = await Coupon.findByIdAndDelete(couponId);
  if (!coupon) throw new AppError('Coupon not found', 404);
};

module.exports = { validateCoupon, getAllCoupons, getActiveCoupons, createCoupon, updateCoupon, deleteCoupon };
