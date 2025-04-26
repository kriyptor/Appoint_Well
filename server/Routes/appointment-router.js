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

router.get('/admin/all', authenticate(['admin']), appointmentController.getAllAppointments);

router.patch('/:id/reschedule/admin', authenticate(['admin']), appointmentController.adminRescheduleAppointment);

router.patch('/:id/cancel/admin', authenticate(['admin']), appointmentController.adminCancelAppointment);


/* -------Staff Routes-------- */

router.get('/staff/all', authenticate(['staff']), appointmentController.getAllStaffAppointments);

module.exports = router;