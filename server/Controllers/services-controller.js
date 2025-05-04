const Services = require(`../Models/services-model`);
const Users = require(`../Models/users-model`);
const { v4: uuidv4 } = require('uuid');

exports.createService = async (req, res) => {
    try {
        const { title, duration, price, category, description, serviceImage } = req.body;
        
        if(!title || !duration || !price || !category){
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        };

        const newServiceData = {
            id: uuidv4(),
            title: title,
            duration: duration,
            price: price,
            category: category,
            description: description || `Service for ${category}`
        }

        if(serviceImage){
            newServiceData.serviceImage = serviceImage;
        }

        const newService = await Services.create(newServiceData);
        
        return res.status(201).json({ 
            success: true,
            message: 'A new service created',
            data: newService
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}


exports.getAllServiceData = async (req, res) => {
    try {

        const allServices = await Services.findAll();

        const allServicesFormattedData = allServices.map(
          ({ id, title, price, category }) => ({
            id,
            title,
            price,
            category,
          })
        );

        return res.status(200).json({ 
            success: true,
            message: 'All services',
            data: allServicesFormattedData
        });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

//TODO:Implement pagination
exports.getAllService = async (req, res) => {
    try {

        const allServices = await Services.findAll()

        return res.status(200).json({ 
            success: true,
            message: 'All services',
            data: allServices
        });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}


exports.getSingleService = async (req, res) => {
    try {
        const serviceId = req.params.id;

        if (!serviceId) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid service ID',
            });
        }
        const servicesData = await Services.findOne({ where: { id: serviceId } });

        if (!servicesData) {
            return res.status(404).json({ 
                success: false,
                message: 'No Service exists',
            });
        }
        return res.status(200).json({ 
            success: true,
            message: 'Here is the service',
            data: servicesData,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
}


exports.updateService = async (req, res) => {
    try {
        const { serviceId, title, duration, price, category, description, serviceImage } = req.body;

        if(!title || !duration || !price || !category){
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        };

        const existingService = await Services.findByPk(serviceId);

        if (!existingService) {
            return res.status(404).json({
                success: false,
                message: 'No Service exists',
            });
        }

        const updatedServicedData = {
            title: title,
            duration: duration,
            price: price,
            category: category,
            description: description || `Service for ${category}`
        };

        if(serviceImage){
            updatedServicedData.serviceImage = serviceImage;
        }

       const updatedService = await Services.update(updatedServicedData, { where : { id: serviceId } })

        return res.status(200).json({ 
            success: true,
            message: 'A new service created',
            data: updatedService
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}



exports.deleteService = async (req, res) => {
    try {
        const serviceId = req.params.id;
        const deletedCount = await Services.destroy({ where: { id: serviceId } });

        if (deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'No Service exists',
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Service is deleted',
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}