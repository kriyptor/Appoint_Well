const express = require(`express`);
const reviewController = require(`../Controllers/review-controller`);
const { authenticate } = require(`../Middleware/role-auth`);
const router = express.Router();

router.post('/user/create', authenticate(['user']), reviewController.userReviewResponse);

router.post('/staff/response', authenticate(['staff']), reviewController.staffReviewResponse);

module.exports = router;