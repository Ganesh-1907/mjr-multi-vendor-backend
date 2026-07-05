const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    storeName: { type: String, required: true, trim: true },
    storeSlug: { type: String, unique: true },
    storeDescription: { type: String },
    storeLogo: { type: String },
    storeBanner: { type: String },
    businessEmail: { type: String, trim: true },
    businessPhone: { type: String, trim: true },
    gstNumber: { type: String, trim: true },
    panNumber: { type: String, trim: true },
    bankAccountNo: { type: String },
    bankIfsc: { type: String },
    bankName: { type: String },
    address: {
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      pincode: String,
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalProducts: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    commissionRate: { type: Number, default: 10 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vendor', vendorSchema);
