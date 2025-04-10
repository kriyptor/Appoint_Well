const express = require(`express`);
const serviceController = require(`../Controllers/services-controller`);
const { authenticate } = require(`../Middleware/role-auth`);
const router = express.Router();

router.get('/get-all-services', authenticate(['user']), serviceController.getAllService);

router.get('/get-single-services/:id', authenticate(['user']), serviceController.getSingleService);

router.post('/create', authenticate(['user']), serviceController.createService);

router.delete('/delete/:id', authenticate(['user']), serviceController.deleteService);

module.exports = router;