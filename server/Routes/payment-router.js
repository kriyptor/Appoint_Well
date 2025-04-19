const express = require(`express`);
const paymentController = require(`../Controllers/payment-controller`);
const { authenticate } = require(`../Middleware/role-auth`);
const router = express.Router();

router.get('/user/wallet-balance', authenticate(['user']), paymentController.getWalletBalance);

router.get('/admin/revenue', authenticate(['admin']), paymentController.getRevenueData);

router.patch('/user/add-money', authenticate(['user']), paymentController.addWalletMoney);

module.exports = router;