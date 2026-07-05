const ProductReview = require('../models/ProductReview');
const Product = require('../models/Product');
const OrderItem = require('../models/OrderItem');
const { AppError } = require('./auth.service');

const getReviewsForProduct = async (productId) => {
  const reviews = await ProductReview.find({ product: productId, status: 'ACTIVE' })
    .populate('user', 'firstName lastName avatar')
    .sort({ createdAt: -1 })
    .lean();

  return reviews.map((r) => ({
    _id: r._id,
    productId: r.product,
    customerId: r.user?._id,
    customerName: r.user ? `${r.user.firstName} ${r.user.lastName}` : 'Anonymous',
    customerAvatar: r.user?.avatar,
    rating: r.rating,
    title: r.title,
    comment: r.comment,
    images: r.images,
    isVerifiedPurchase: r.isVerifiedPurchase,
    helpfulCount: r.helpfulCount,
    variant: r.variant,
    createdAt: r.createdAt,
  }));
};

const addReview = async (userId, productId, request) => {
  const product = await Product.findById(productId);
  if (!product) throw new AppError('Product not found');

  // Check if user already reviewed
  const existingReview = await ProductReview.findOne({ product: productId, user: userId });
  if (existingReview) throw new AppError('You have already reviewed this product');

  // Check verified purchase
  const orderItem = await OrderItem.findOne({ product: productId }).populate({
    path: 'order',
    match: { user: userId },
  });

  const review = await ProductReview.create({
    product: productId,
    user: userId,
    variant: request.variantId || null,
    rating: request.rating,
    title: request.title || '',
    comment: request.comment || '',
    images: request.images || [],
    isVerifiedPurchase: !!orderItem,
    helpfulCount: 0,
    status: 'ACTIVE',
  });

  // Update product rating
  await updateProductRating(productId);

  return review;
};

const updateReview = async (reviewId, userId, request) => {
  const review = await ProductReview.findOne({ _id: reviewId, user: userId });
  if (!review) throw new AppError('Review not found or not authorized', 404);

  if (request.rating) review.rating = request.rating;
  if (request.title !== undefined) review.title = request.title;
  if (request.comment !== undefined) review.comment = request.comment;
  if (request.images) review.images = request.images;

  await review.save();
  await updateProductRating(review.product);

  return review;
};

const deleteReview = async (reviewId, userId) => {
  const review = await ProductReview.findOne({ _id: reviewId, user: userId });
  if (!review) throw new AppError('Review not found or not authorized', 404);

  await ProductReview.deleteOne({ _id: reviewId });
  await updateProductRating(review.product);
};

const getVendorReviews = async (vendorUserId) => {
  const Vendor = require('../models/Vendor');
  const vendor = await Vendor.findOne({ user: vendorUserId });
  if (!vendor) throw new AppError('Vendor profile not found');

  const vendorProducts = await Product.find({ vendor: vendor._id }).distinct('_id');
  const reviews = await ProductReview.find({ product: { $in: vendorProducts }, status: 'ACTIVE' })
    .populate('user', 'firstName lastName avatar')
    .populate('product', 'name slug')
    .sort({ createdAt: -1 })
    .lean();

  return reviews.map((r) => ({
    _id: r._id,
    productId: r.product?._id,
    productName: r.product?.name,
    productSlug: r.product?.slug,
    customerId: r.user?._id,
    customerName: r.user ? `${r.user.firstName} ${r.user.lastName}` : 'Anonymous',
    rating: r.rating,
    title: r.title,
    comment: r.comment,
    images: r.images,
    isVerifiedPurchase: r.isVerifiedPurchase,
    createdAt: r.createdAt,
  }));
};

const updateProductRating = async (productId) => {
  const stats = await ProductReview.aggregate([
    { $match: { product: productId, status: 'ACTIVE' } },
    { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  const rating = stats.length > 0 ? Math.round(stats[0].avgRating * 10) / 10 : 0;
  const totalReviews = stats.length > 0 ? stats[0].count : 0;

  await Product.findByIdAndUpdate(productId, { rating, totalReviews });
};

module.exports = { getReviewsForProduct, addReview, updateReview, deleteReview, getVendorReviews };
