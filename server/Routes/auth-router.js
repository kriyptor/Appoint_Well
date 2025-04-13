const express = require(`express`);
const authController = require(`../Controllers/auth-controller`);
const router = express.Router();

/* ------------User Auth Routes-------------- */
router.post('/user/sign-in', authController.loginUser);

router.post('/user/sign-up', authController.createUser);

/* ------------Admin Auth Routes-------------- */
router.post('/admin/sign-in', authController.loginAdmin);

/* ------------Staff Auth Routes-------------- */
router.post('/staff/sign-in', authController.loginStaff);


module.exports = router;