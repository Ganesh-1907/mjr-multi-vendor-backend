const vendorService = require('../services/vendor.service');
const productService = require('../services/product.service');
const ApiResponse = require('../utils/ApiResponse');

const getAllVendors = async (req, res, next) => {
  try {
    const vendors = await vendorService.getAllVendors();
    res.json(ApiResponse.success(vendors));
  } catch (error) {
    next(error);
  }
};

const getVendorById = async (req, res, next) => {
  try {
    const vendor = await vendorService.getVendorById(req.params.idOrSlug);
    res.json(ApiResponse.success(vendor));
  } catch (error) {
    next(error);
  }
};

const getVendorProducts = async (req, res, next) => {
  try {
    const result = await productService.getProducts({ ...req.query, vendor: req.params.vendorId });
    res.json(ApiResponse.success(result));
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllVendors, getVendorById, getVendorProducts };
