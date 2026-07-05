const mongoose = require('mongoose');

const productReviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    variant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductVariant',
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, trim: true },
    comment: { type: String, trim: true },
    images: [{ type: String }],
    isVerifiedPurchase: { type: Boolean, default: false },
    helpfulCount: { type: Number, default: 0 },
    status: { type: String, enum: ['ACTIVE', 'PENDING', 'REJECTED'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

productReviewSchema.index({ product: 1, status: 1 });
productReviewSchema.index({ product: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('ProductReview', productReviewSchema);
