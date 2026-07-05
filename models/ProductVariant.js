const mongoose = require('mongoose');

const productVariantSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true },
    price: { type: Number, required: true, min: 0 },
    comparePrice: { type: Number, min: 0 },
    costPrice: { type: Number, min: 0 },
    stockQuantity: { type: Number, default: 1000, min: 0 },
    lowStockThreshold: { type: Number, default: 10 },
    image: { type: String },
    attributes: { type: Map, of: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProductVariant', productVariantSchema);
