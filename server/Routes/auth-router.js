const express = require(`express`);
const userController = require(`../Controllers/user-controller`);
const { userAuthenticate } = require(`../Middleware/user-auth`);
const router = express.Router();


router.post('/user/sign-in', userController.loginUser);

router.post('/user/sign-up', userController.createUser);

router.post('/admin/sign-in', userController.loginAdmin);

router.post('/admin/sign-up', userController.createAdmin);


module.exports = router;