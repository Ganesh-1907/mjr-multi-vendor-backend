const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    type: {
      type: String,
      enum: ['PERCENTAGE', 'FIXED'],
      required: true,
    },
    value: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0, min: 0 },
    maxDiscountAmount: { type: Number, min: 0 },
    usageLimit: { type: Number, default: 0, min: 0 },
    perUserLimit: { type: Number, default: 1, min: 1 },
    usedCount: { type: Number, default: 0, min: 0 },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Coupon', couponSchema);
