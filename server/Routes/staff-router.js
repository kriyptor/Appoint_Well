const express = require(`express`);
const staffController = require(`../Controllers/staff-controller`);
const { authenticate } = require(`../Middleware/role-auth`);
const router = express.Router();

/* -------Admin Routes-------- */

router.post('/all-staff', authenticate(['admin']), staffController.getAllStaff);

router.post('/create', authenticate(['admin']), staffController.createStaff);

router.patch('/:id', authenticate(['admin']), staffController.updateStaff);

router.delete('/:id', authenticate(['admin']), staffController.deleteStaff);

module.exports = router;