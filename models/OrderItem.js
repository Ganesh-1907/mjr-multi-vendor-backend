const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    variant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductVariant',
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    productName: { type: String, required: true },
    productImage: { type: String },
    variantName: { type: String },
    sku: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    vendorPayout: { type: Number, min: 0 },
    commissionAmount: { type: Number, min: 0 },
  },
  { timestamps: true }
);

orderItemSchema.index({ order: 1 });
orderItemSchema.index({ vendor: 1 });

module.exports = mongoose.model('OrderItem', orderItemSchema);
