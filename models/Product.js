const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    shortDescription: { type: String, trim: true },
    description: { type: String },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    basePrice: { type: Number, default: 0 },
    approvalStatus: {
      type: String,
      enum: ['DRAFT', 'PENDING_REVIEW', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED'],
      default: 'DRAFT',
    },
    availabilityStatus: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK'],
      default: 'INACTIVE',
    },
    reviewComments: { type: String, default: '' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    tags: [{ type: String }],
    specifications: { type: Map, of: String },
  },
  { timestamps: true }
);


productSchema.index({ approvalStatus: 1, availabilityStatus: 1, isFeatured: 1 });
productSchema.index({ approvalStatus: 1, availabilityStatus: 1, isTrending: 1 });
productSchema.index({ category: 1, approvalStatus: 1, availabilityStatus: 1 });
productSchema.index({ vendor: 1, approvalStatus: 1, availabilityStatus: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
