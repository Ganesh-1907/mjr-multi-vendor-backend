const mongoose = require('mongoose');

const vendorPayoutSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    payoutNumber: { type: String, required: true, unique: true },
    amount: { type: Number, required: true, min: 0 },
    commissionDeducted: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSED', 'COMPLETED', 'FAILED'],
      default: 'PENDING',
    },
    periodStart: { type: Date },
    periodEnd: { type: Date },
    processedAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('VendorPayout', vendorPayoutSchema);
