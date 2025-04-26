const Appointments = require('../Models/appointments-model');
const Reviews = require(`../Models/reviews-model`);
const { v4: uuidv4 } = require('uuid');

exports.userReviewResponse = async (req, res) => {
    try {
        const userId = req.user.id;
        const { appointmentId, rating, reviewComment } = req.body;

        if (!appointmentId || !rating) {
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

        const appointment = await Appointments.findOne({
            where: { id: appointmentId, userId: userId, status: 'completed' }
        });

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found or you do not have permission to review it'
            });
        }

        const existingReview = await Reviews.findOne({
            where: {
                userId : userId,
                staffId: appointment.staffId,
                appointmentsId : appointmentId
            }
        });
        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already submitted a review for this appointment'
            });
        }

        const newId = uuidv4();
       
        const reviewData = {
            id: newId,
            rating,
            userId,
            staffId : appointment.staffId,
            appointmentsId: appointmentId,
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
        const staffId = req.staff.id;
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

        if (review.isStaffResponded) {
            return res.status(400).json({
                success: false,
                message: 'Staff has already responded to this review'
            });
        }
        if (review.staffId !== staffId) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to respond to this review'
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