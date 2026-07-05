const Banner = require('../models/Banner');
const { AppError } = require('./auth.service');

const getActiveBanners = async () => {
  return Banner.find({ isActive: true }).sort({ sortOrder: 1 });
};

const getAllBanners = async () => Banner.find().sort({ sortOrder: 1 });

const createBanner = async (request) => Banner.create(request);

const updateBanner = async (bannerId, request) => {
  const banner = await Banner.findByIdAndUpdate(bannerId, request, { new: true });
  if (!banner) throw new AppError('Banner not found', 404);
  return banner;
};

const deleteBanner = async (bannerId) => {
  const banner = await Banner.findByIdAndDelete(bannerId);
  if (!banner) throw new AppError('Banner not found', 404);
};

module.exports = { getActiveBanners, getAllBanners, createBanner, updateBanner, deleteBanner };
