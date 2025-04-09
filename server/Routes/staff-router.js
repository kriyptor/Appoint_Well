const express = require(`express`);
const staffController = require(`../Controllers/staff-controller`);
const { adminAuthenticate } = require(`../Middleware/admin-auth`);
const router = express.Router();

/* -------Admin Routes-------- */

router.post('/all-staff', adminAuthenticate, staffController.getAllStaff);

router.post('/create', adminAuthenticate, staffController.createStaff);

router.patch('/:id', adminAuthenticate, staffController.updateStaff);

router.delete('/:id', adminAuthenticate, staffController.deleteStaff);

module.exports = router;