const mongoose = require('mongoose');

const returnRequestSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    orderItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OrderItem',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reason: { type: String, required: true },
    images: [{ type: String }],
    status: {
      type: String,
      enum: ['REQUESTED', 'APPROVED', 'REJECTED', 'PICKED_UP', 'REFUNDED'],
      default: 'REQUESTED',
    },
    refundAmount: { type: Number, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ReturnRequest', returnRequestSchema);
