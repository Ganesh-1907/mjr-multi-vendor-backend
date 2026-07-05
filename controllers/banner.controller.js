const bannerService = require('../services/banner.service');
const ApiResponse = require('../utils/ApiResponse');

const getAllBanners = async (req, res, next) => {
  try {
    const banners = await bannerService.getAllBanners();
    res.json(ApiResponse.success(banners));
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllBanners };
