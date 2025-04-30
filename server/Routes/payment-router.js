const express = require(`express`);
const paymentController = require(`../Controllers/payment-controller`);
const { authenticate } = require(`../Middleware/role-auth`);
const router = express.Router();

/* -------------User Routes-------------- */

router.get('/user/wallet-balance', authenticate(['user']), paymentController.getWalletBalance);

router.patch('/user/add-money', authenticate(['user']), paymentController.addWalletMoney);

router.post('/user/create-session', authenticate(['user']), paymentController.createOrder);

router.post('/user/verify', authenticate(['user']), paymentController.verifyPayment);

/* --------Admin Routes--------- */

router.get('/admin/revenue', authenticate(['admin']), paymentController.getRevenueData);

module.exports = router;