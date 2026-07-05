const profileService = require('../services/profile.service');
const ApiResponse = require('../utils/ApiResponse');

const getProfile = async (req, res, next) => {
  try {
    const profile = await profileService.getProfile(req.user.userId);
    res.json(ApiResponse.success(profile));
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const profile = await profileService.updateProfile(req.user.userId, req.body);
    res.json(ApiResponse.success(profile, 'Profile updated'));
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile };
