const express = require(`express`);
const appointmentController = require(`../Controllers/appointment-controller`);
const { authenticate } = require(`../Middleware/role-auth`);
const router = express.Router();

/* ---------User Routes--------- */

router.post('/create', authenticate(['user']), appointmentController.userCreateAppointment);

router.get('/user/upcoming', authenticate(['user']), appointmentController.getUpcomingUserAppointments);

router.get('/user/previous', authenticate(['user']), appointmentController.getPreviousUserAppointments);

router.get('/user/canceled', authenticate(['user']), appointmentController.getCanceledUserAppointments);

router.patch('/:id/reschedule', authenticate(['user']), appointmentController.userRescheduleAppointment);

router.patch('/cancel/:id', authenticate(['user']), appointmentController.userCancelAppointment);

/* -------Admin Routes-------- */

router.get('/admin/upcoming', authenticate(['admin']), appointmentController.getAllUpcomingAppointments);

router.get('/admin/previous', authenticate(['admin']), appointmentController.getAllPreviousAppointments);

router.get('/admin/canceled', authenticate(['admin']), appointmentController.getAllCanceledAppointments);

router.patch('/:id/reschedule/admin', authenticate(['admin']), appointmentController.adminRescheduleAppointment);

router.patch('/:id/cancel/admin', authenticate(['admin']), appointmentController.adminCancelAppointment);

/* -------Staff Routes-------- */

router.get('/staff/upcoming', authenticate(['staff']), appointmentController.getUpcomingStaffAppointments);

router.get('/staff/previous', authenticate(['staff']), appointmentController.getPreviousStaffAppointments);

module.exports = router;