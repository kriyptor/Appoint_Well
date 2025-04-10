const Reviews = require(`../Models/reviews-model`);
const { v4: uuidv4 } = require('uuid');

exports.userReviewResponse = async (req, res) => {
    try {
        const userId = req.user.id;
        const { serviceId, staffId, appointmentId, rating, reviewComment } = req.body;

        if (!serviceId || !staffId || !appointmentId || !rating) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be provided'
            });
        }

        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be an integer between 1 and 5'
            });
        }

        const newId = uuidv4();
        const reviewData = {
            id: newId,
            rating,
            userId,
            staffId,
            serviceId,
            appointmentId,
            ...(reviewComment && { comment: reviewComment })
        };

        const newReview = await Reviews.create(reviewData);

        return res.status(201).json({
            success: true,
            message: 'Review Submitted',
            data: newReview
        });
    } catch (error) {
        console.error('Review submission error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}



exports.staffReviewResponse = async (req, res) => {
    try {
        const { reviewId, responseMessage } = req.body;

        if (!reviewId || !responseMessage) {
            return res.status(400).json({
                success: false,
                message: 'Review ID and response message are required'
            });
        }


        const review = await Reviews.findByPk(reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        review.staffResponse = responseMessage;
        review.isStaffResponded = true;
        await review.save();

        return res.status(200).json({
            success: true,
            message: 'Staff response submitted successfully',
            data: {
                reviewId: review.id,
                staffResponse: review.staffResponse,
                updatedAt: review.updatedAt
            }
        });
    } catch (error) {
        console.error('Staff response error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}