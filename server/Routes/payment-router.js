const express = require(`express`);
const paymentController = require(`../Controllers/payment-controller`);
const { authenticate } = require(`../Middleware/role-auth`);
const router = express.Router();

router.patch('/user/add-money', authenticate(['user']), paymentController.addWalletMoney);

module.exports = router;