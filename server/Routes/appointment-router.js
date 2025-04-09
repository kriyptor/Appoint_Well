const express = require(`express`);
const appointmentController = require(`../Controllers/appointment-controller`);
const { userAuthenticate } = require(`../Middleware/user-auth`);
const { adminAuthenticate } = require(`../Middleware/admin-auth`);
const router = express.Router();

/* ---------User Routes--------- */

router.post('/create', userAuthenticate, appointmentController.userCreateAppointment);

router.get('/user', userAuthenticate, appointmentController.getAllUserAppointments);

router.patch('/:id/reschedule', userAuthenticate, appointmentController.userRescheduleAppointment);

router.patch('/:id/cancel', userAuthenticate, appointmentController.userCancelAppointment);

/* -------Admin Routes-------- */

router.get('/admin', adminAuthenticate, appointmentController.getAllAppointments);

router.patch('/:id/reschedule/admin', adminAuthenticate, appointmentController.adminRescheduleAppointment);

router.patch('/:id/cancel/admin', adminAuthenticate, appointmentController.adminCancelAppointment);

module.exports = router;