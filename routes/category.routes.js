const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');

router.get('/', categoryController.getAllCategories);
router.get('/:slug', categoryController.getCategoryBySlug);
router.get('/:slug/products', categoryController.getProductsByCategory);

module.exports = router;
