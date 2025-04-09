const Services = require(`../Models/services-model`);
const Users = require(`../Models/users-model`);
const { v4: uuidv4 } = require('uuid');

exports.createService = async (req, res) => {
    try {
        const { title, duration, price, category, description, serviceImage } = req.body;
        
        const adminId = req.user.id

        if(!title || !duration || !price || !category){
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        };

        const admin = await Users.findByPk(adminId);

        if(admin.isAdmin === false){
            return res.status(400).json({
                success: false,
                message: 'Only admin can create services'
            });
        }

        let newService;

        if(serviceImage){
            newService = await Services.create({
                id: uuidv4(),
                title: title,
                duration: duration,
                price: price,
                category: category,
                description: description || `Service for ${category}`,
                serviceImage: serviceImage,
            })
        }else{
            newService = await Services.create({
                id: uuidv4(),
                title: title,
                duration: duration,
                price: price,
                category: category,
                description: description || `Service for ${category}`,
            })
        }
        
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

        const servicesData = await Services.findAll({ where : { id : serviceId } });

        return res.status(200).json({ 
            success: true,
            message: 'Here is list of all services',
            data: servicesData
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


exports.updateService = async (req, res) => {
    try {

        const { serviceId, title, duration, price, category, description, serviceImage } = req.body;
        
        const adminId = req.user.id

        if(!title || !duration || !price || !category){
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        };

        const admin = await Users.findByPk(adminId);

        if(admin.isAdmin === false){
            return res.status(400).json({
                success: false,
                message: 'Only admin can create services'
            });
        }

        let updatedService;

        if(serviceImage){
            updatedService = await Services.update({
                title: title,
                duration: duration,
                price: price,
                category: category,
                description: description || `Service for ${category}`,
                serviceImage: serviceImage,
            }, { where : { id: serviceId } })
        }else{
            updatedService = await Services.update({
                title: title,
                duration: duration,
                price: price,
                category: category,
                description: description || `Service for ${category}`,
            }, { where : { id: serviceId } })
        }


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
        const adminId = req.user.id;

        const serviceId = req.params.id;

        const admin = await Users.findByPk(adminId);

        if(admin.isAdmin === false){
            return res.status(400).json({
                success: false,
                message: 'Only admin can delete a service'
            });
        }

        const deletedService = await Services.destroy({ where : { id: serviceId } });

        return res.status(200).json({ 
            success: true,
            message: 'Service is deleted',
            data: deletedService
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