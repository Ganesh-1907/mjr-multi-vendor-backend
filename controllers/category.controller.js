const categoryService = require('../services/category.service');
const productService = require('../services/product.service');
const ApiResponse = require('../utils/ApiResponse');

const getAllCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getAllCategories(true);
    // Add product count
    const Product = require('../models/Product');
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Product.countDocuments({ category: cat._id, status: 'APPROVED' });
        return { ...cat, productCount: count };
      })
    );
    res.json(ApiResponse.success(categoriesWithCount));
  } catch (error) {
    next(error);
  }
};

const getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await categoryService.getCategoryBySlug(req.params.slug);
    res.json(ApiResponse.success(category));
  } catch (error) {
    next(error);
  }
};

const getProductsByCategory = async (req, res, next) => {
  try {
    const category = await categoryService.getCategoryBySlug(req.params.slug);
    const result = await productService.getProducts({ ...req.query, category: category._id });
    res.json(ApiResponse.success(result));
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllCategories, getCategoryBySlug, getProductsByCategory };
