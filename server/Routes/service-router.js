const express = require(`express`);
const serviceController = require(`../Controllers/services-controller`);
const { userAuthenticate } = require(`../Middleware/user-auth`);
const router = express.Router();

router.get('/get-all-services', userAuthenticate, serviceController.getAllService);

router.get('/get-single-services/:id', userAuthenticate, serviceController.getSingleService);

router.post('/create', userAuthenticate, serviceController.createService);

router.delete('/delete/:id', userAuthenticate, serviceController.deleteService);

module.exports = router;