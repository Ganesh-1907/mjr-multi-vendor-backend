const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    variant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductVariant',
    },
    quantity: { type: Number, required: true, min: 1, default: 1 },
  },
  { timestamps: true }
);

cartItemSchema.index({ user: 1 });

module.exports = mongoose.model('CartItem', cartItemSchema);
