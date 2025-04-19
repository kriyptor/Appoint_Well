const express = require(`express`);
const appointmentController = require(`../Controllers/appointment-controller`);
const { authenticate } = require(`../Middleware/role-auth`);
const router = express.Router();

/* ---------User Routes--------- */

router.post('/create', authenticate(['user']), appointmentController.userCreateAppointment);

router.get('/user/all', authenticate(['user']), appointmentController.getAllUserAppointments);

router.patch('/:id/reschedule', authenticate(['user']), appointmentController.userRescheduleAppointment);

router.patch('/cancel/:id', authenticate(['user']), appointmentController.userCancelAppointment);

/* -------Admin Routes-------- */

router.get('/admin/all', authenticate(['admin']), appointmentController.getAllAppointments);

router.patch('/:id/reschedule/admin', authenticate(['admin']), appointmentController.adminRescheduleAppointment);

router.patch('/:id/cancel/admin', authenticate(['admin']), appointmentController.adminCancelAppointment);

module.exports = router;