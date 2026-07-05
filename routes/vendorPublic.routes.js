const express = require('express');
const router = express.Router();
const vendorPublicController = require('../controllers/vendorPublic.controller');

router.get('/', vendorPublicController.getAllVendors);
router.get('/:idOrSlug', vendorPublicController.getVendorById);
router.get('/:vendorId/products', vendorPublicController.getVendorProducts);

module.exports = router;
