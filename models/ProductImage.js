const mongoose = require('mongoose');

const productImageSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    url: { type: String, required: true },
    altText: { type: String },
    isPrimary: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProductImage', productImageSchema);
