const WishlistItem = require('../models/WishlistItem');
const Product = require('../models/Product');
const ProductImage = require('../models/ProductImage');
const ProductVariant = require('../models/ProductVariant');
const { AppError } = require('./auth.service');

const getWishlist = async (userId) => {
  const items = await WishlistItem.find({ user: userId })
    .populate('product', 'name slug rating totalReviews status')
    .sort({ createdAt: -1 })
    .lean();

  const productIds = items.filter((i) => i.product).map((i) => i.product._id);
  const primaryImages = await ProductImage.find({ product: { $in: productIds }, isPrimary: true }).lean();
  const firstVariants = await ProductVariant.aggregate([
    { $match: { product: { $in: productIds } } },
    { $sort: { price: 1 } },
    { $group: { _id: '$product', variantId: { $first: '$_id' }, price: { $first: '$price' }, comparePrice: { $first: '$comparePrice' }, stockQuantity: { $first: '$stockQuantity' } } },
  ]);

  const imageMap = {};
  primaryImages.forEach((img) => { imageMap[img.product.toString()] = img.url; });
  const variantMap = {};
  firstVariants.forEach((v) => { variantMap[v._id.toString()] = { variantId: v.variantId, price: v.price, comparePrice: v.comparePrice, stockQuantity: v.stockQuantity }; });

  const wishlistItems = items
    .filter((i) => i.product)
    .map((i) => ({
      _id: i._id,
      productId: i.product._id,
      productName: i.product.name,
      productSlug: i.product.slug,
      productImageUrl: imageMap[i.product._id.toString()] || null,
      variantId: variantMap[i.product._id.toString()]?.variantId || null,
      price: variantMap[i.product._id.toString()]?.price || 0,
      comparePrice: variantMap[i.product._id.toString()]?.comparePrice || null,
      rating: i.product.rating,
      totalReviews: i.product.totalReviews,
      inStock: (variantMap[i.product._id.toString()]?.stockQuantity || 0) > 0,
      addedAt: i.createdAt,
    }));

  return { items: wishlistItems, itemCount: wishlistItems.length };
};

const addToWishlist = async (userId, productId) => {
  const product = await Product.findById(productId);
  if (!product) throw new AppError('Product not found');

  const existing = await WishlistItem.findOne({ user: userId, product: productId });
  if (!existing) {
    await WishlistItem.create({ user: userId, product: productId });
  }

  return getWishlist(userId);
};

const removeFromWishlist = async (userId, productId) => {
  await WishlistItem.deleteOne({ user: userId, product: productId });
  return getWishlist(userId);
};

const isInWishlist = async (userId, productId) => {
  const exists = await WishlistItem.findOne({ user: userId, product: productId });
  return !!exists;
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist, isInWishlist };
