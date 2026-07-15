const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const OrderTracking = require('../models/OrderTracking');
const ProductVariant = require('../models/ProductVariant');
const Product = require('../models/Product');
const CartItem = require('../models/CartItem');
const Vendor = require('../models/Vendor');
const Coupon = require('../models/Coupon');
const CouponUsage = require('../models/CouponUsage');
const User = require('../models/User');
const Address = require('../models/Address');
const { nanoid } = require('nanoid');
const { AppError } = require('./auth.service');

const generateOrderNumber = async () => {
  const date = new Date();
  const prefix = `ORD-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-`;
  const suffix = nanoid(8).toUpperCase();
  return `${prefix}${suffix}`;
};

const placeOrder = async (userId, request) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found');

  const { items, couponCode, shippingAddress, paymentMethod = 'RAZORPAY',
    razorpayOrderId, razorpayPaymentId, razorpaySignature } = request;

  if (!items || items.length === 0) throw new AppError('Cart is empty');

  // Validate stock and build order items
  const orderItems = [];
  let subtotal = 0;

  for (const item of items) {
    const variant = await ProductVariant.findById(item.variantId);
    if (!variant) throw new AppError(`Variant not found: ${item.variantId}`);
    if (variant.stockQuantity < item.quantity) throw new AppError(`Insufficient stock for ${variant.name}`);

    const product = await Product.findById(variant.product).populate('vendor');
    if (!product) throw new AppError('Product not found');

    const lineTotal = variant.price * item.quantity;
    const commissionAmount = lineTotal * 0.1;
    const vendorPayout = lineTotal - commissionAmount;

    orderItems.push({
      product: product._id,
      variant: variant._id,
      vendor: product.vendor._id,
      productName: product.name,
      productImage: variant.image || null,
      variantName: variant.name,
      sku: variant.sku,
      quantity: item.quantity,
      unitPrice: variant.price,
      totalPrice: lineTotal,
      vendorPayout,
      commissionAmount,
    });

    subtotal += lineTotal;
  }

  // Validate coupon
  let discount = 0;
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
    if (!coupon) throw new AppError('Invalid coupon code');
    if (coupon.validFrom > new Date() || coupon.validUntil < new Date()) throw new AppError('Coupon expired');
    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) throw new AppError('Coupon usage limit reached');
    if (subtotal < coupon.minOrderAmount) throw new AppError(`Minimum order amount of ₹${coupon.minOrderAmount} required`);

    // Per-user limit check
    const userUsageCount = await CouponUsage.countDocuments({ coupon: coupon._id, user: userId });
    if (userUsageCount >= coupon.perUserLimit) throw new AppError('Coupon already used');

    if (coupon.type === 'PERCENTAGE') {
      discount = Math.round((subtotal * coupon.value) / 100);
      if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) discount = coupon.maxDiscountAmount;
    } else {
      discount = coupon.value;
    }
  }

  // Calculate totals
  const shippingCost = 100;
  const tax = Math.round(subtotal * 0.18);
  const totalAmount = subtotal - discount + shippingCost + tax;

  // Create order
  const orderNumber = await generateOrderNumber();
  const estimatedDeliveryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const order = await Order.create({
    orderNumber,
    user: userId,
    customerName: `${user.firstName} ${user.lastName}`,
    customerEmail: user.email,
    subtotal,
    discount,
    couponCode: couponCode ? couponCode.toUpperCase() : undefined,
    shippingCost,
    tax,
    totalAmount,
    shippingAddress,
    paymentMethod,
    status: 'PENDING',
    paymentStatus: razorpayPaymentId ? 'COMPLETED' : 'PENDING',
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    estimatedDeliveryDate,
  });

  // Create order items with order reference
  const orderItemDocs = orderItems.map((item) => ({
    ...item,
    order: order._id,
  }));
  await OrderItem.insertMany(orderItemDocs);

  // Create tracking entry
  await OrderTracking.create({
    order: order._id,
    status: 'CONFIRMED',
    description: 'Order placed successfully',
  });

  // Deduct stock
  for (const item of items) {
    await ProductVariant.findByIdAndUpdate(item.variantId, {
      $inc: { stockQuantity: -item.quantity },
    });
  }

  // Update coupon usage
  if (couponCode && discount > 0) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    await CouponUsage.create({
      coupon: coupon._id,
      user: userId,
      order: order._id,
      discountAmount: discount,
    });
    await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });
  }

  // Clear cart
  await CartItem.deleteMany({ user: userId });

  // Update vendor totalSales
  for (const item of orderItems) {
    await Vendor.findByIdAndUpdate(item.vendor, { $inc: { totalSales: item.totalPrice } });
  }

  // If address doesn't exist for user, save it
  if (shippingAddress) {
    const existingAddress = await Address.findOne({
      user: userId,
      addressLine1: shippingAddress.addressLine1,
      city: shippingAddress.city,
    });
    if (!existingAddress) {
      await Address.create({
        user: userId,
        type: 'HOME',
        fullName: shippingAddress.fullName,
        phone: shippingAddress.phone,
        addressLine1: shippingAddress.addressLine1,
        addressLine2: shippingAddress.addressLine2 || '',
        city: shippingAddress.city,
        state: shippingAddress.state,
        pincode: shippingAddress.pincode,
        isDefault: false,
      });
    }
  }

  return getOrderById(order._id);
};

const getOrderById = async (orderId) => {
  const order = await Order.findById(orderId).lean();
  if (!order) throw new AppError('Order not found', 404);

  const items = await OrderItem.find({ order: orderId }).lean();
  const tracking = await OrderTracking.find({ order: orderId }).sort({ createdAt: -1 }).lean();

  return { ...order, items, tracking };
};

const getUserOrders = async (userId) => {
  const orders = await Order.find({ user: userId }).sort({ createdAt: -1 }).lean();
  const orderIds = orders.map((o) => o._id);
  const items = await OrderItem.find({ order: { $in: orderIds } }).lean();

  const itemMap = {};
  items.forEach((item) => {
    if (!itemMap[item.order.toString()]) itemMap[item.order.toString()] = [];
    itemMap[item.order.toString()].push(item);
  });

  return orders.map((order) => ({
    ...order,
    items: itemMap[order._id.toString()] || [],
  }));
};

const cancelOrder = async (orderId, userId) => {
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) throw new AppError('Order not found', 404);

  if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
    throw new AppError('Order cannot be cancelled at this stage');
  }

  order.status = 'CANCELLED';
  await order.save();

  // Restore stock
  const items = await OrderItem.find({ order: orderId });
  for (const item of items) {
    if (item.variant) {
      await ProductVariant.findByIdAndUpdate(item.variant, {
        $inc: { stockQuantity: item.quantity },
      });
    }
  }

  await OrderTracking.create({
    order: orderId,
    status: 'CANCELLED',
    description: 'Order cancelled by customer',
  });

  return getOrderById(orderId);
};

const updateOrderStatus = async (orderId, status, description, location) => {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError('Order not found', 404);

  const upperStatus = status.toUpperCase();
  order.status = upperStatus;
  if (upperStatus === 'DELIVERED') {
    order.paymentStatus = 'COMPLETED';
    order.deliveredAt = new Date();
  }
  if (upperStatus === 'CANCELLED') {
    // Restore stock
    const items = await OrderItem.find({ order: orderId });
    for (const item of items) {
      if (item.variant) {
        await ProductVariant.findByIdAndUpdate(item.variant, {
          $inc: { stockQuantity: item.quantity },
        });
      }
    }
  }
  await order.save();

  await OrderTracking.create({
    order: orderId,
    status: upperStatus,
    description: description || `Order ${upperStatus.toLowerCase()}`,
    location,
  });

  return getOrderById(orderId);
};

const getVendorOrders = async (vendorUserId) => {
  const vendor = await Vendor.findOne({ user: vendorUserId });
  if (!vendor) throw new AppError('Vendor profile not found');

  const vendorOrderItems = await OrderItem.find({ vendor: vendor._id }).distinct('order');
  const orders = await Order.find({ _id: { $in: vendorOrderItems } })
    .sort({ createdAt: -1 })
    .lean();

  const orderIds = orders.map((o) => o._id);
  const items = await OrderItem.find({ order: { $in: orderIds }, vendor: vendor._id }).lean();

  const itemMap = {};
  items.forEach((item) => {
    if (!itemMap[item.order.toString()]) itemMap[item.order.toString()] = [];
    itemMap[item.order.toString()].push(item);
  });

  return orders.map((order) => ({
    ...order,
    items: itemMap[order._id.toString()] || [],
  }));
};

const getOrderTracking = async (orderId) => {
  return OrderTracking.find({ order: orderId }).sort({ createdAt: -1 });
};

module.exports = {
  placeOrder,
  getOrderById,
  getUserOrders,
  cancelOrder,
  updateOrderStatus,
  getVendorOrders,
  getOrderTracking,
};
