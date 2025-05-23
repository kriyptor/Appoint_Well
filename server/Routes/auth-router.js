const express = require(`express`);
const authController = require(`../Controllers/auth-controller`);
const { authenticate } = require(`../Middleware/role-auth`);
const router = express.Router();

/* ------------User Auth Routes-------------- */
router.post('/user/sign-in', authController.loginUser);

router.post('/user/sign-up', authController.createUser);

router.get('/user/data', authenticate(['user']), authController.getUserData);

router.post('/user/update', authenticate(['user']), authController.updateUserData);


/* ------------Admin Auth Routes-------------- */
router.post('/admin/sign-in', authController.loginAdmin);

router.get('/admin/data', authenticate(['admin']), authController.getAdminData);

router.post('/admin/update', authenticate(['admin']), authController.updateAdminData);


/* ------------Staff Auth Routes-------------- */
router.post('/staff/sign-in', authController.loginStaff);

router.get('/staff/data', authenticate(['staff']), authController.getStaffData);

router.post('/staff/update', authenticate(['staff']), authController.updateStaffData);

module.exports = router;