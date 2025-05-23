const express = require(`express`);
const serviceController = require(`../Controllers/services-controller`);
const { authenticate } = require(`../Middleware/role-auth`);
const router = express.Router();

router.get('/get-all-services', authenticate(['admin','user']), serviceController.getAllService);

router.get('/get-all-services-data', authenticate(['admin','user']), serviceController.getAllServiceData);

router.get('/get-single-service/:id', authenticate(['admin','user']), serviceController.getSingleService);

router.post('/create', authenticate(['admin']), serviceController.createService);

router.post('/update', authenticate(['admin']), serviceController.updateService);

router.delete('/delete/:id', authenticate(['admin']), serviceController.deleteService);

module.exports = router;