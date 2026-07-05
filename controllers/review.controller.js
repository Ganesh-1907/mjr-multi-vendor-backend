const reviewService = require('../services/review.service');
const ApiResponse = require('../utils/ApiResponse');

const addReview = async (req, res, next) => {
  try {
    const review = await reviewService.addReview(req.user.userId, req.body.productId, req.body);
    res.json(ApiResponse.success(review, 'Review added'));
  } catch (error) {
    next(error);
  }
};

const updateReview = async (req, res, next) => {
  try {
    const review = await reviewService.updateReview(req.params.reviewId, req.user.userId, req.body);
    res.json(ApiResponse.success(review, 'Review updated'));
  } catch (error) {
    next(error);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    await reviewService.deleteReview(req.params.reviewId, req.user.userId);
    res.json(ApiResponse.success(null, 'Review deleted'));
  } catch (error) {
    next(error);
  }
};

module.exports = { addReview, updateReview, deleteReview };
