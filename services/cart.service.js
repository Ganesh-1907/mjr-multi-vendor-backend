const CartItem = require('../models/CartItem');
const ProductVariant = require('../models/ProductVariant');
const ProductImage = require('../models/ProductImage');
const { AppError } = require('./auth.service');

const getCart = async (userId) => {
  const items = await CartItem.find({ user: userId })
    .populate('product', 'name slug status')
    .populate('variant')
    .lean();

  let subtotal = 0;
  const cartItems = items
    .filter((item) => item.product && item.variant)
    .map((item) => {
      const total = item.variant.price * item.quantity;
      subtotal += total;
      return {
        _id: item._id,
        productId: item.product._id,
        productName: item.product.name,
        productSlug: item.product.slug,
        variantId: item.variant._id,
        variantName: item.variant.name,
        variantImage: item.variant.image,
        price: item.variant.price,
        quantity: item.quantity,
        total,
        stockAvailable: item.variant.stockQuantity,
      };
    });

  return { items: cartItems, itemCount: cartItems.length, subtotal };
};

const addToCart = async (userId, { productId, variantId, quantity = 1 }) => {
  const variant = await ProductVariant.findById(variantId);
  if (!variant) throw new AppError('Variant not found');

  if (variant.stockQuantity < quantity) throw new AppError('Insufficient stock');

  const existingItem = await CartItem.findOne({ user: userId, product: productId, variant: variantId });
  if (existingItem) {
    const newQty = existingItem.quantity + quantity;
    if (newQty > variant.stockQuantity) throw new AppError('Insufficient stock');
    existingItem.quantity = newQty;
    await existingItem.save();
  } else {
    await CartItem.create({ user: userId, product: productId, variant: variantId, quantity });
  }

  return getCart(userId);
};

const updateQuantity = async (userId, cartItemId, quantity) => {
  const item = await CartItem.findOne({ _id: cartItemId, user: userId }).populate('variant');
  if (!item) throw new AppError('Cart item not found');

  if (quantity < 1) throw new AppError('Quantity must be at least 1');
  if (item.variant && quantity > item.variant.stockQuantity) throw new AppError('Insufficient stock');

  item.quantity = quantity;
  await item.save();

  return getCart(userId);
};

const removeFromCart = async (userId, cartItemId) => {
  const item = await CartItem.findOne({ _id: cartItemId, user: userId });
  if (!item) throw new AppError('Cart item not found');

  await CartItem.deleteOne({ _id: cartItemId });
  return getCart(userId);
};

const clearCart = async (userId) => {
  await CartItem.deleteMany({ user: userId });
};

module.exports = { getCart, addToCart, updateQuantity, removeFromCart, clearCart };
