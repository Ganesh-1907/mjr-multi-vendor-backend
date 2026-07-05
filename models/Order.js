const mongoose = require('mongoose');

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    customerName: { type: String },
    customerEmail: { type: String },
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    couponCode: { type: String },
    shippingCost: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    shippingAddress: { type: shippingAddressSchema, required: true },
    paymentMethod: {
      type: String,
      enum: ['CARD', 'UPI', 'NETBANKING', 'WALLET', 'COD', 'RAZORPAY'],
      default: 'RAZORPAY',
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'],
      default: 'PENDING',
    },
    estimatedDeliveryDate: { type: Date },
    deliveredAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

orderSchema.index({ orderNumber: 1 });
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);
