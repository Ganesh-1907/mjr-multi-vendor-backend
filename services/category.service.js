const Category = require('../models/Category');
const Product = require('../models/Product');
const { generateUniqueSlug } = require('../utils/slugify');
const { AppError } = require('./auth.service');

const getAllCategories = async (activeOnly = true) => {
  const query = activeOnly ? { isActive: true } : {};
  const categories = await Category.find(query).sort({ displayOrder: 1 }).lean();
  
  const productCounts = await Promise.all(
    categories.map(cat => Product.countDocuments({ category: cat._id, status: 'APPROVED' }))
  );
  
  return categories.map((cat, index) => ({
    ...cat,
    productCount: productCounts[index]
  }));
};

const getCategoryBySlug = async (slug) => {
  const category = await Category.findOne({ slug }).lean();
  if (!category) throw new AppError('Category not found', 404);
  return category;
};

const getProductsByCategory = async (slug) => {
  const category = await Category.findOne({ slug });
  if (!category) throw new AppError('Category not found', 404);

  const ProductService = require('./product.service');
  return ProductService.getProducts({ category: category._id });
};

const createCategory = async (request) => {
  const slug = await generateUniqueSlug(request.name, Category);
  return Category.create({ ...request, slug });
};

const updateCategory = async (categoryId, request) => {
  const category = await Category.findById(categoryId);
  if (!category) throw new AppError('Category not found', 404);

  if (request.name && request.name !== category.name) {
    category.slug = await generateUniqueSlug(request.name, Category, category._id);
  }

  Object.assign(category, request);
  await category.save();
  return category;
};

const deleteCategory = async (categoryId) => {
  const subcategories = await Category.countDocuments({ parent: categoryId });
  if (subcategories > 0) throw new AppError('Cannot delete category with subcategories');

  const products = await Product.countDocuments({ category: categoryId });
  if (products > 0) throw new AppError('Cannot delete category with products');

  await Category.findByIdAndDelete(categoryId);
};

module.exports = { getAllCategories, getCategoryBySlug, getProductsByCategory, createCategory, updateCategory, deleteCategory };
