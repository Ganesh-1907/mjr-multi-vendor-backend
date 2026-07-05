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
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'DRAFT'],
      default: 'PENDING',
    },
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    tags: [{ type: String }],
    specifications: { type: Map, of: String },
  },
  { timestamps: true }
);

productSchema.index({ slug: 1 });
productSchema.index({ status: 1, isFeatured: 1 });
productSchema.index({ status: 1, isTrending: 1 });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ vendor: 1, status: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
