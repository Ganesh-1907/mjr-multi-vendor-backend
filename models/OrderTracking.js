const mongoose = require('mongoose');

const orderTrackingSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'],
      required: true,
    },
    description: { type: String },
    location: { type: String },
  },
  { timestamps: true }
);

orderTrackingSchema.index({ order: 1 });

module.exports = mongoose.model('OrderTracking', orderTrackingSchema);
