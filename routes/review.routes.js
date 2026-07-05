const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/', authenticate, reviewController.addReview);
router.put('/:reviewId', authenticate, reviewController.updateReview);
router.delete('/:reviewId', authenticate, reviewController.deleteReview);

module.exports = router;
