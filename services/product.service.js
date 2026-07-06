const Product = require('../models/Product');
const ProductVariant = require('../models/ProductVariant');
const ProductImage = require('../models/ProductImage');
const ProductReview = require('../models/ProductReview');
const Vendor = require('../models/Vendor');
const Category = require('../models/Category');
const OrderItem = require('../models/OrderItem');
const { generateUniqueSlug } = require('../utils/slugify');
const { AppError } = require('./auth.service');

const getProductBySlug = async (slug) => {
  const product = await Product.findOne({ slug, status: 'APPROVED' })
    .populate('vendor', 'storeName storeSlug rating')
    .populate('category', 'name slug');

  if (!product) throw new AppError('Product not found', 404);

  const variants = await ProductVariant.find({ product: product._id });
  const images = await ProductImage.find({ product: product._id });

  return {
    ...product.toObject(),
    variants,
    images,
  };
};

const getProducts = async (filters = {}) => {
  const {
    category,
    vendor: vendorId,
    minPrice,
    maxPrice,
    sort,
    page = 1,
    size = 12,
    search,
    minRating,
  } = filters;

  const pageNum = parseInt(page) > 0 ? parseInt(page) : 1;
  const skip = (pageNum - 1) * parseInt(size);
  const limit = parseInt(size);

  const query = { status: 'APPROVED' };

  if (category) {
    const Category = require('../models/Category');
    const catDoc = await Category.findOne({ slug: category });
    if (catDoc) {
      query.category = catDoc._id;
    } else {
      // If category slug not found, return empty result
      return { products: [], total: 0, page: pageNum, totalPages: 0 };
    }
  }

  if (vendorId) query.vendor = vendorId;
  if (minRating) query.rating = { $gte: parseFloat(minRating) };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } },
    ];
  }

  let sortQuery = { createdAt: -1 };
  switch (sort) {
    case 'newest': sortQuery = { createdAt: -1 }; break;
    case 'price_asc': sortQuery = { 'price': 1 }; break;
    case 'price_desc': sortQuery = { 'price': -1 }; break;
    case 'rating': sortQuery = { rating: -1 }; break;
    case 'popular': sortQuery = { totalReviews: -1 }; break;
    case 'name_asc': sortQuery = { name: 1 }; break;
    case 'featured': sortQuery = { isFeatured: -1, createdAt: -1 }; break;
    default: sortQuery = { createdAt: -1 };
  }

  // For price filtering, we need to look up variants
  let productIds = null;
  if (minPrice || maxPrice) {
    const variantQuery = {};
    if (minPrice) variantQuery.price = { $gte: parseFloat(minPrice) };
    if (maxPrice) {
      variantQuery.price = { ...(variantQuery.price || {}), $lte: parseFloat(maxPrice) };
    }
    const variants = await ProductVariant.find(variantQuery).distinct('product');
    productIds = variants;
    if (productIds.length > 0) {
      query._id = { $in: productIds };
    } else {
      return { products: [], total: 0, page: parseInt(page), totalPages: 0 };
    }
  }

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate('vendor', 'storeName storeSlug')
      .populate('category', 'name slug')
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(query),
  ]);

  // Get primary image and first variant price for each product
  const productIds_arr = products.map((p) => p._id);
  const primaryImages = await ProductImage.find({ product: { $in: productIds_arr }, isPrimary: true }).lean();
  const firstVariants = await ProductVariant.aggregate([
    { $match: { product: { $in: productIds_arr } } },
    { $sort: { price: 1 } },
    { $group: { _id: '$product', price: { $first: '$price' }, comparePrice: { $first: '$comparePrice' }, stockQuantity: { $first: '$stockQuantity' }, variantId: { $first: '$_id' } } },
  ]);

  const imageMap = {};
  primaryImages.forEach((img) => { imageMap[img.product.toString()] = img.url; });

  const variantMap = {};
  firstVariants.forEach((v) => { variantMap[v._id.toString()] = { price: v.price, comparePrice: v.comparePrice, stockQuantity: v.stockQuantity, id: v.variantId }; });

  const productList = products.map((p) => {
    const v = variantMap[p._id.toString()];
    return {
      ...p,
      id: p._id,
      primaryImageUrl: imageMap[p._id.toString()] || null,
      primaryVariantPrice: v?.price || 0,
      primaryVariantComparePrice: v?.comparePrice || null,
      primaryVariantId: v?.id || null,
      stockQuantity: v?.stockQuantity || 0,
    };
  });

  return {
    products: productList,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limit),
  };
};

const getFeaturedProducts = async () => {
  return getProducts({ sort: 'featured', size: 8 });
};

const getTrendingProducts = async () => {
  const products = await Product.find({ status: 'APPROVED', isTrending: true })
    .populate('vendor', 'storeName storeSlug')
    .populate('category', 'name slug')
    .limit(8)
    .lean();

  const productIds = products.map((p) => p._id);
  const primaryImages = await ProductImage.find({ product: { $in: productIds }, isPrimary: true }).lean();
  const firstVariants = await ProductVariant.aggregate([
    { $match: { product: { $in: productIds } } },
    { $sort: { price: 1 } },
    { $group: { _id: '$product', price: { $first: '$price' }, comparePrice: { $first: '$comparePrice' }, stockQuantity: { $first: '$stockQuantity' }, variantId: { $first: '$_id' } } },
  ]);

  const imageMap = {};
  primaryImages.forEach((img) => { imageMap[img.product.toString()] = img.url; });
  const variantMap = {};
  firstVariants.forEach((v) => { variantMap[v._id.toString()] = { price: v.price, comparePrice: v.comparePrice, stockQuantity: v.stockQuantity, id: v.variantId }; });

  return products.map((p) => {
    const v = variantMap[p._id.toString()];
    return {
      ...p,
      id: p._id,
      primaryImageUrl: imageMap[p._id.toString()] || null,
      primaryVariantPrice: v?.price || 0,
      primaryVariantComparePrice: v?.comparePrice || null,
      primaryVariantId: v?.id || null,
      stockQuantity: v?.stockQuantity || 0,
    };
  });
};

const getRelatedProducts = async (productId, limit = 4) => {
  const product = await Product.findById(productId);
  if (!product) throw new AppError('Product not found', 404);

  const related = await Product.find({
    _id: { $ne: productId },
    category: product.category,
    status: 'APPROVED',
  })
    .populate('vendor', 'storeName storeSlug')
    .limit(limit)
    .lean();

  const productIds = related.map((p) => p._id);
  const primaryImages = await ProductImage.find({ product: { $in: productIds }, isPrimary: true }).lean();
  const firstVariants = await ProductVariant.aggregate([
    { $match: { product: { $in: productIds } } },
    { $sort: { price: 1 } },
    { $group: { _id: '$product', price: { $first: '$price' }, comparePrice: { $first: '$comparePrice' }, variantId: { $first: '$_id' } } },
  ]);

  const imageMap = {};
  primaryImages.forEach((img) => { imageMap[img.product.toString()] = img.url; });
  const variantMap = {};
  firstVariants.forEach((v) => { variantMap[v._id.toString()] = { price: v.price, comparePrice: v.comparePrice, id: v.variantId }; });

  return related.map((p) => {
    const v = variantMap[p._id.toString()];
    return {
      ...p,
      id: p._id,
      primaryImageUrl: imageMap[p._id.toString()] || null,
      primaryVariantPrice: v?.price || 0,
      primaryVariantComparePrice: v?.comparePrice || null,
      primaryVariantId: v?.id || null,
    };
  });
};

const createProduct = async (vendorUserId, request) => {
  const vendor = await Vendor.findOne({ user: vendorUserId });
  if (!vendor) throw new AppError('Vendor profile not found');

  const slug = await generateUniqueSlug(request.name, Product);
  const category = await Category.findById(request.categoryId);
  if (!category) throw new AppError('Category not found');

  const product = await Product.create({
    vendor: vendor._id,
    category: request.categoryId,
    name: request.name,
    slug,
    shortDescription: request.shortDescription || '',
    description: request.description || '',
    status: 'PENDING',
    isFeatured: false,
    isTrending: false,
    tags: request.tags || [],
    specifications: request.specifications || {},
  });

  // Create variants
  if (request.variants && request.variants.length > 0) {
    const variants = request.variants.map((v) => ({
      product: product._id,
      name: v.name,
      sku: v.sku || `${slug.toUpperCase()}-${nanoid(6).toUpperCase()}`,
      price: v.price,
      comparePrice: v.comparePrice,
      costPrice: v.costPrice,
      stockQuantity: v.stockQuantity || 1000,
      image: v.image,
      attributes: v.attributes || {},
    }));
    await ProductVariant.insertMany(variants);
  }

  // Create images
  if (request.images && request.images.length > 0) {
    const images = request.images.map((img, idx) => ({
      product: product._id,
      url: img.url,
      altText: img.altText || request.name,
      isPrimary: idx === 0,
    }));
    await ProductImage.insertMany(images);
  }

  vendor.totalProducts = (vendor.totalProducts || 0) + 1;
  await vendor.save();

  return product;
};

const updateProduct = async (productId, vendorUserId, request) => {
  const vendor = await Vendor.findOne({ user: vendorUserId });
  if (!vendor) throw new AppError('Vendor profile not found');

  const product = await Product.findOne({ _id: productId, vendor: vendor._id });
  if (!product) throw new AppError('Product not found or not authorized', 404);

  if (request.name && request.name !== product.name) {
    product.slug = await generateUniqueSlug(request.name, Product, product._id);
  }

  if (request.categoryId) product.category = request.categoryId;
  if (request.name) product.name = request.name;
  if (request.shortDescription !== undefined) product.shortDescription = request.shortDescription;
  if (request.description !== undefined) product.description = request.description;
  if (request.tags) product.tags = request.tags;
  if (request.specifications) product.specifications = request.specifications;

  // Reset status to PENDING on update
  if (product.status === 'APPROVED' || product.status === 'REJECTED') {
    product.status = 'PENDING';
  }

  await product.save();

  // Update variants - delete existing, create new
  if (request.variants) {
    await ProductVariant.deleteMany({ product: product._id });
    const variants = request.variants.map((v) => ({
      product: product._id,
      name: v.name,
      sku: v.sku || `${product.slug.toUpperCase()}-${nanoid(6).toUpperCase()}`,
      price: v.price,
      comparePrice: v.comparePrice,
      costPrice: v.costPrice,
      stockQuantity: v.stockQuantity || 1000,
      image: v.image,
      attributes: v.attributes || {},
    }));
    await ProductVariant.insertMany(variants);
  }

  // Update images
  if (request.images) {
    await ProductImage.deleteMany({ product: product._id });
    const images = request.images.map((img, idx) => ({
      product: product._id,
      url: img.url,
      altText: img.altText || product.name,
      isPrimary: idx === 0,
    }));
    await ProductImage.insertMany(images);
  }

  return product;
};

const deleteProduct = async (productId, vendorUserId) => {
  const vendor = await Vendor.findOne({ user: vendorUserId });
  if (!vendor) throw new AppError('Vendor profile not found');

  const product = await Product.findOne({ _id: productId, vendor: vendor._id });
  if (!product) throw new AppError('Product not found or not authorized', 404);

  await ProductVariant.deleteMany({ product: product._id });
  await ProductImage.deleteMany({ product: product._id });
  await Product.deleteOne({ _id: product._id });

  vendor.totalProducts = Math.max(0, (vendor.totalProducts || 0) - 1);
  await vendor.save();
};

const approveProduct = async (productId) => {
  const product = await Product.findByIdAndUpdate(productId, { status: 'APPROVED' }, { new: true });
  if (!product) throw new AppError('Product not found', 404);
  return product;
};

const rejectProduct = async (productId) => {
  const product = await Product.findByIdAndUpdate(productId, { status: 'REJECTED' }, { new: true });
  if (!product) throw new AppError('Product not found', 404);
  return product;
};

const getPendingProducts = async () => {
  const products = await Product.find({ status: 'PENDING' })
    .sort({ createdAt: -1 })
    .lean();

  const productIds = products.map((p) => p._id);
  const variants = await ProductVariant.find({ product: { $in: productIds } }).lean();
  const images = await ProductImage.find({ product: { $in: productIds } }).lean();

  const variantMap = {};
  variants.forEach((v) => {
    if (!variantMap[v.product.toString()]) variantMap[v.product.toString()] = [];
    variantMap[v.product.toString()].push(v);
  });

  const imageMap = {};
  images.forEach((img) => {
    if (!imageMap[img.product.toString()]) imageMap[img.product.toString()] = [];
    imageMap[img.product.toString()].push(img);
  });

  return products.map((p) => ({
    ...p,
    id: p._id,
    vendorId: p.vendor,
    categoryId: p.category,
    variants: variantMap[p._id.toString()] || [],
    images: imageMap[p._id.toString()] || []
  }));
};

const getAllProducts = async () => {
  const products = await Product.find({ status: { $ne: 'DRAFT' } })
    .sort({ createdAt: -1 })
    .lean();

  const productIds = products.map((p) => p._id);
  const variants = await ProductVariant.find({ product: { $in: productIds } }).lean();
  const images = await ProductImage.find({ product: { $in: productIds } }).lean();

  const variantMap = {};
  variants.forEach((v) => {
    if (!variantMap[v.product.toString()]) variantMap[v.product.toString()] = [];
    variantMap[v.product.toString()].push(v);
  });

  const imageMap = {};
  images.forEach((img) => {
    if (!imageMap[img.product.toString()]) imageMap[img.product.toString()] = [];
    imageMap[img.product.toString()].push(img);
  });

  return products.map((p) => ({
    ...p,
    id: p._id,
    vendorId: p.vendor,
    categoryId: p.category,
    variants: variantMap[p._id.toString()] || [],
    images: imageMap[p._id.toString()] || []
  }));
};

const getVendorProducts = async (vendorUserId) => {
  const vendor = await Vendor.findOne({ user: vendorUserId });
  if (!vendor) throw new AppError('Vendor profile not found');

  const products = await Product.find({ vendor: vendor._id })
    .populate('category', 'name slug')
    .sort({ createdAt: -1 })
    .lean();

  const productIds = products.map((p) => p._id);
  const variants = await ProductVariant.find({ product: { $in: productIds } }).lean();
  const images = await ProductImage.find({ product: { $in: productIds }, isPrimary: true }).lean();

  const variantMap = {};
  variants.forEach((v) => {
    if (!variantMap[v.product.toString()]) variantMap[v.product.toString()] = [];
    variantMap[v.product.toString()].push(v);
  });

  const imageMap = {};
  images.forEach((img) => { imageMap[img.product.toString()] = img.url; });

  return products.map((p) => ({
    ...p,
    variants: variantMap[p._id.toString()] || [],
    image: imageMap[p._id.toString()] || null,
  }));
};

module.exports = {
  getProductBySlug,
  getProducts,
  getFeaturedProducts,
  getTrendingProducts,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  approveProduct,
  rejectProduct,
  getPendingProducts,
  getAllProducts,
  getVendorProducts,
};
