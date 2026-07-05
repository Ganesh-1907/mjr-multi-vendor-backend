const productService = require('../services/product.service');
const reviewService = require('../services/review.service');
const ApiResponse = require('../utils/ApiResponse');

const getProducts = async (req, res, next) => {
  try {
    const result = await productService.getProducts(req.query);
    res.json(ApiResponse.success(result));
  } catch (error) {
    next(error);
  }
};

const getProductBySlug = async (req, res, next) => {
  try {
    const product = await productService.getProductBySlug(req.params.slug);
    res.json(ApiResponse.success(product));
  } catch (error) {
    next(error);
  }
};

const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await productService.getFeaturedProducts();
    res.json(ApiResponse.success(products.products || products));
  } catch (error) {
    next(error);
  }
};

const getTrendingProducts = async (req, res, next) => {
  try {
    const products = await productService.getTrendingProducts();
    res.json(ApiResponse.success(products));
  } catch (error) {
    next(error);
  }
};

const getRelatedProducts = async (req, res, next) => {
  try {
    const products = await productService.getRelatedProducts(req.params.productId);
    res.json(ApiResponse.success(products));
  } catch (error) {
    next(error);
  }
};

const getProductReviews = async (req, res, next) => {
  try {
    const reviews = await reviewService.getReviewsForProduct(req.params.productId);
    res.json(ApiResponse.success(reviews));
  } catch (error) {
    next(error);
  }
};

const addProductReview = async (req, res, next) => {
  try {
    const review = await reviewService.addReview(req.user.userId, req.params.productId, req.body);
    res.json(ApiResponse.success(review, 'Review added'));
  } catch (error) {
    next(error);
  }
};

module.exports = { getProducts, getProductBySlug, getFeaturedProducts, getTrendingProducts, getRelatedProducts, getProductReviews, addProductReview };
