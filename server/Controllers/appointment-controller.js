const Services = require(`../Models/services-model`);
const Users = require(`../Models/users-model`);
const Revenue = require(`../Models/revenue-model`);
const Appointments = require(`../Models/appointments-model`);
const StaffService = require(`../Models/staff-service-model`);
const Staffs = require(`../Models/staffs-model`);
const Reviews = require('../Models/reviews-model');
const { timeDifferenceValidation, convertDateFormat } = require(`../Utils/utility-functions`);
const db = require(`../Utils/database`);
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');

/* -----------User Appointment Controllers------------- */

exports.userCreateAppointment = async (req, res) => {
    const transaction = await db.transaction();
    try {
        const userId = req.user.id;
        const { serviceId, date, startTime, price, paymentStatus, paymentMode, category } = req.body;

        if(!serviceId || !date || !startTime || !price || !paymentStatus || !paymentMode || !category){
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Validate appointment is not in the past
        const appointmentDateTime = new Date(`${date}T${startTime}`);
        if (appointmentDateTime < new Date()) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Cannot book appointments in the past'
            });
        }

        const newApptId = uuidv4();
        const formattedDate = convertDateFormat(date);

        const currWalletBalance = req.user.walletBalance
        // Handle wallet payment with transaction to prevent race conditions
        if (paymentMode === "wallet") {

            if (currWalletBalance < price) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false, 
                    message: "Insufficient wallet balance"
                });
            }
            
            await Users.decrement("walletBalance", {
                by: price,
                where: { id: userId },
                transaction
            });
        }

        const service = await Services.findByPk(serviceId, { 
            include: [{
                model: Staffs,
                through: {
                    attributes: []
                },
                attributes: ['id', 'name']
            }]
        }, transaction);

        if (!service) {
            await transaction.rollback();
            console.log(`Service with ID ${serviceId} not found.`);
            return res.status(404).json({ // Use 404 for not found
                success: false,
                message: `Service with ID ${serviceId} not found.`
            });
        }

        const availableStaff = service['Staff-Members'];

        console.log(`Available Staff for Service ID ${serviceId}:`, availableStaff);

        if(!availableStaff || availableStaff.length === 0){
            await transaction.rollback();
            console.log(`No staff available for service ID ${serviceId}.`);
            return res.status(409).json({ // Use 409 Conflict or another appropriate status
                success: false,
                message: `Sorry, no staff members are currently available for the selected service.`
            });
        }

         // Randomly select a staff member from the available list
         const randomIndex = Math.floor(Math.random() * availableStaff.length);
         const selectedStaff = availableStaff[randomIndex]; // Get the full staff object
         const selectedStaffId = selectedStaff.id;
         const selectedStaffName = selectedStaff.name; // Get the staff name
 
         console.log(`Selected Staff ID: ${selectedStaffId}, Name: ${selectedStaffName} for Service ID: ${serviceId}`);

        const newAppointmentData = {
            id: newApptId,
            date: formattedDate,
            startTime: startTime,
            price: price,
            paymentStatus: paymentStatus,
            userId: userId,
            staffId: selectedStaffId,
            staffName: selectedStaffName,
            serviceId: serviceId,
            serviceName: service.title,
        };

        const newAppointment = await Appointments.create(newAppointmentData, { transaction });

        await Revenue.increment(
            [`totalRevenue`, `${category}ServiceRevenue`],
            { by: price, where: { id: 1 }, transaction }
        );

        await transaction.commit();

        return res.status(201).json({ 
            success: true,
            message: 'A new appointment is created',
            data: newAppointment
        });
    
    } catch (error) {
        await transaction.rollback();
        console.error(error);
        return res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

exports.getUpcomingUserAppointments = async (req, res) => {
    try {

        const userId = req.user.id;
        const allAppointment = await Appointments.findAll({
          where: { userId: userId, [Op.or]: [{ status: 'scheduled' }, { status: 'rescheduled' }] },
          include:[
            {
            model : Staffs,
            attributes: ['profilePicture'],
            }
        ],
          order : [['date']]
        });

        const formatedAppointmentData = allAppointment.map((data) => ({
            id: data.id,
            status: data.status,
            date: data.date,
            startTime: data.startTime,
            serviceId: data.serviceId,
            serviceTitle: data.serviceName,
            staff: data.staffId,
            staffName: data.staffName,
            staffProfilePicture: data['Staff-Member'].profilePicture,
            refundStatus : data.refundStatus,
            price: data.price,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        }));

        return res.status(200).json({ 
            success: true,
            message: 'All the upcoming appointments',
            data: formatedAppointmentData
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

exports.getCanceledUserAppointments = async (req, res) => {
    try {

        const userId = req.user.id;

        const allAppointment = await Appointments.findAll({
          where: { userId: userId, status: 'canceled' },
          include:[
            {
            model : Staffs,
            attributes: ['profilePicture'],
            }
        ],
          order : [['date']]
        });

        const formatedAppointmentData = allAppointment.map((data) => ({
            id: data.id,
            status: data.status,
            date: data.date,
            startTime: data.startTime,
            serviceId: data.serviceId,
            serviceTitle: data.serviceName,
            staff: data.staffId,
            staffName: data.staffName,
            staffProfilePicture: data['Staff-Member'].profilePicture,
            refundStatus : data.refundStatus,
            price: data.price,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        }))

        return res.status(200).json({ 
            success: true,
            message: 'All the upcoming appointments',
            data: formatedAppointmentData
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

exports.getPreviousUserAppointments = async (req, res) => {
    try {

        const userId = req.user.id;
        const currentDate = new Date().toISOString().split('T')[0];
        
        const allAppointment = await Appointments.findAll({
          where: { userId: userId, [Op.or] : { date: { [Op.lt]: currentDate }, status : 'completed' } },
          include:[
            {
            model : Staffs,
            attributes: ['profilePicture'],
            },

            {
                model: Reviews
            }
        ],
          order : [['date', 'DESC']]
        });

        const formatedAppointmentData = allAppointment.map((data) => ({
            id: data.id,
            status: data.status,
            date: data.date,
            startTime: data.startTime,
            serviceId: data.serviceId,
            serviceTitle: data.serviceName,
            staff: data.staffId,
            staffName: data.staffName,
            staffProfilePicture: data['Staff-Member'].profilePicture,
            refundStatus : data.refundStatus,
            price: data.price,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            review: data.Review ? {
                id: data.Review.id,
                rating: data.Review.rating,
                comment: data.Review.comment,
                isStaffResponded: data.Review.isStaffResponded,
                staffResponse: data.Review.staffResponse
            } : null
        }));

        return res.status(200).json({ 
            success: true,
            message: 'All the appointments',
            data: formatedAppointmentData
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


exports.userRescheduleAppointment = async (req, res) => {
    try {

        const appointmentId = req.params.id;

        const { date, startTime } = req.body;

        if (!appointmentId || !date || !startTime) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        };

        const appointment = await Appointments.findByPk(appointmentId);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'No Appointment Found'
            });
        }

        if (['rescheduled','canceled', 'unattained', 'completed'].includes(appointment.status)) {
            return res.status(400).json({
                success: false,
                message: `Appointment is ${appointment.status} and cannot be canceled`
            });
        }

          //TODO: Add rescheduled mail service


          if(!timeDifferenceValidation(appointment.date, appointment.startTime)){
            return res.status(400).json({
                success: false,
                message: 'Appointment cannot be rescheduled at this point',
            });
          }

        appointment.status = 'rescheduled';
        appointment.date = convertDateFormat(date);
        appointment.startTime = startTime;
        await appointment.save();

        return res.status(200).json({
            success: true,
            message: 'Appointment rescheduled successfully',
            data: appointment
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

//TODO: Add canceled mail service & time contraint
exports.userCancelAppointment = async (req, res) => {
    const transaction = await db.transaction();
    try {
        const userId = req.user.id;
        const appointmentId = req.params.id;

        if(!appointmentId){
            return res.status(400).json({
                success: false,
                message: 'No Appointment-Id found'
            });
        }

        const appointment = await Appointments.findOne({
            where: {
                id: appointmentId,
                userId: userId 
            },
            transaction
        });

        if (!appointment) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: `No Appointment Found with id: ${appointmentId}`
            });
        }

        // Expanded status validation
       if (['canceled', 'unattained', 'completed'].includes(appointment.status)) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: `Appointment is ${appointment.status} and cannot be canceled`
            });
        }
        
        // Update appointment status
        appointment.status = 'canceled';
        await appointment.save({ transaction });
        
        // Determine if refund is eligible
        let refundStatus = "No Refund";
    
        if(timeDifferenceValidation(appointment.date, appointment.startTime)){
            // Process refund
            await Users.increment('walletBalance', {
                by: appointment.price,
                where: { id: userId },
                transaction
            });

            const revenueData = await Revenue.findByPk(1, { transaction });
            revenueData.totalRevenue -= appointment.price;
            revenueData.totalRefunds += appointment.price;
            await revenueData.save({ transaction });
            refundStatus = "Refund Processed";
        }

        appointment.refundStatus = true;
        await appointment.save({ transaction });

        await transaction.commit();

        return res.status(200).json({
            success: true,
            message: 'Appointment canceled successfully',
            refundStatus: refundStatus,
            data: appointment
        });

    } catch (error) {
        await transaction.rollback();
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}



/*------------Admin Appointment Controllers-------------*/

exports.getAllUpcomingAppointments = async (req, res) => {
    try {

        const allAppointment = await Appointments.findAll({
            include:[
                {
                    model : Users,
                    attributes: ['name', 'profilePicture'],
                },
                {
                    model : Staffs,
                    attributes: ['profilePicture'],
                }
            ],
            order : [['createdAt', 'DESC']]
        });

        const formatedAppointmentData = allAppointment.map((data) => ({
            id: data.id,
            userId: data.userId,
            userName: data.User.name,
            userProfilePicture: data.User.profilePicture,
            serviceTitle: data.serviceName,
            serviceId: data.serviceId,
            date: data.date,
            time: data.startTime,
            staffId: data.staffId,
            staffName: data.staffName,
            staffProfilePicture: data['Staff-Member'].profilePicture,
            refundStatus : data.refundStatus,
            price: data.price,
            serviceId: data.serviceId,
            status: data.status,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
        }))

        return res.status(200).json({ 
            success: true,
            message: 'All the appointments',
            data: formatedAppointmentData
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

exports.getAllPreviousAppointments = async (req, res) => {
    try {

        const allAppointment = await Appointments.findAll({
            /* where: { [Op.or] : { date: { [Op.lt]: currentDate }, status : 'completed' } }, */
            where: { status : 'completed' },
            include:[
                {
                    model : Users,
                    attributes: ['name', 'profilePicture'],
                },
                {
                    model : Staffs,
                    attributes: ['profilePicture'],
                },
                {
                    model: Reviews
                }
            ],
            order : [['date', 'DESC']]
        });

        const formatedAppointmentData = allAppointment.map((data) => ({
            id: data.id,
            status: data.status,
            date: data.date,
            startTime: data.startTime,
            serviceId: data.serviceId,
            serviceTitle: data.serviceName,
            userId: data.userId,
            userName: data.User.name,
            userProfilePicture: data.User.profilePicture,
            staff: data.staffId,
            staffName: data.staffName,
            staffProfilePicture: data['Staff-Member'].profilePicture,
            refundStatus : data.refundStatus,
            price: data.price,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            review: data.Review ? {
                id: data.Review.id,
                rating: data.Review.rating,
                comment: data.Review.comment,
                isStaffResponded: data.Review.isStaffResponded,
                staffResponse: data.Review.staffResponse
            } : null
        }))

        return res.status(200).json({ 
            success: true,
            message: 'All the appointments',
            data: formatedAppointmentData
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


exports.getAllCanceledAppointments = async (req, res) => {
    try {

        const allAppointment = await Appointments.findAll({
          where: { status: 'canceled' },
          include:[
            {
                model : Staffs,
                attributes: ['profilePicture'],
            },
            {
                model : Users,
                attributes: ['name', 'profilePicture'],
            }
        ],
          order : [['date']]
        });

        const formatedAppointmentData = allAppointment.map((data) => ({
            id: data.id,
            status: data.status,
            date: data.date,
            startTime: data.startTime,
            serviceId: data.serviceId,
            serviceTitle: data.serviceName,
            userId: data.userId,
            userName: data.User.name,
            userProfilePicture: data.User.profilePicture,
            staff: data.staffId,
            staffName: data.staffName,
            staffProfilePicture: data['Staff-Member'].profilePicture,
            refundStatus : data.refundStatus,
            price: data.price,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        }))

        return res.status(200).json({ 
            success: true,
            message: 'All the upcoming appointments',
            data: formatedAppointmentData
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


exports.adminRescheduleAppointment = async (req, res) => {
    try {
        const { appointmentId, date, startTime } = req.body;

        if (!appointmentId || !date || !startTime) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        };

        const appointment = await Appointments.findByPk(appointmentId);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'No Appointment Found'
            });
        }

        // Expanded status validation
        if (['canceled', 'unattained', 'completed'].includes(appointment.status)) {
            return res.status(400).json({
                success: false,
                message: `Appointment is ${appointment.status} and cannot be canceled`
            });
        }

        if(!timeDifferenceValidation(appointment.date, appointment.startTime)){
            return res.status(400).json({
                success: true,
                message: 'Appointment cannot be rescheduled at this point',
            });
          }

        appointment.status = 'rescheduled';
        appointment.date = date;
        appointment.startTime = startTime;
        await appointment.save();

        return res.status(200).json({
            success: true,
            message: 'Appointment rescheduled successfully',
            data: appointment
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


exports.adminCancelAppointment = async (req, res) => {
    const transaction = await db.transaction();
    try {
        const appointmentId = req.params.id;

        if(!appointmentId){
            return res.status(400).json({
                success: false,
                message: 'No Appointment-Id found'
            });
        }

        const appointment = await Appointments.findByPk(appointmentId);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: `No Appointment Found with id: ${appointmentId}`
            });
        }

        // Expanded status validation
        if (['canceled', 'unattained', 'completed'].includes(appointment.status)) {
            return res.status(400).json({
                success: false,
                message: `Appointment is ${appointment.status} and cannot be canceled`
            });
        }

        await Users.increment('walletBalance', {
            by: appointment.price,
            where: { id: appointment.userId },
            transaction
        });

        const revenueData = await Revenue.findByPk(1, { transaction });
        revenueData.totalRevenue -= appointment.price;
        revenueData.totalRefunds += appointment.price;
        await revenueData.save({ transaction });


        appointment.status = 'canceled';
        await appointment.save({ transaction });

        await transaction.commit();

        return res.status(200).json({
            success: true,
            message: 'Appointment canceled successfully',
            data: appointment
        });

    } catch (error) {
        await transaction.rollback();

        console.error(error)
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

/* -------------Staff Appointments Controllers------------------ */
exports.getUpcomingStaffAppointments = async (req, res) => {
    try {
        const staffId = req.staff.id;

        const allAppointment = await Appointments.findAll({
            where: { staffId: staffId, [Op.or]: [{ status: 'scheduled' }, { status: 'rescheduled' }] },
            include:[
              {
              model : Users,
              attributes: ['name', 'profilePicture'],
              }
          ],
            order : [['date']]
          });

          const formatedAppointmentData = allAppointment.map((data) => ({
            id: data.id,
            status: data.status,
            date: data.date,
            startTime: data.startTime,
            serviceId: data.serviceId,
            serviceTitle: data.serviceName,
            staff: data.staffId,
            staffName: data.staffName,
            userId: data.userId,
            userName: data.User.name,
            userProfilePicture: data.User.profilePicture,
            refundStatus : data.refundStatus,
            price: data.price,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        }))

        return res.status(200).json({ 
            success: true,
            message: 'All the staff appointments',
            data: formatedAppointmentData
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

exports.getPreviousStaffAppointments = async (req, res) => {
    try {

        const staffId = req.staff.id;
        const currentDate = new Date().toISOString().split('T')[0];
        
        const allAppointment = await Appointments.findAll({
          where: { staffId: staffId, [Op.or] : { date: { [Op.lt]: currentDate }, status : 'completed' } },
          include:[
            {
            model : Users,
            attributes: ['name','profilePicture'],
            },

            {
                model: Reviews
            }
        ],
          order : [['date', 'DESC']]
        });

        const formatedAppointmentData = allAppointment.map((data) => ({
            id: data.id,
            status: data.status,
            date: data.date,
            startTime: data.startTime,
            serviceId: data.serviceId,
            serviceTitle: data.serviceName,
            staff: data.staffId,
            staffName: data.staffName,
            userId: data.userId,
            userName: data.User.name,
            userProfilePicture: data.User.profilePicture,
            refundStatus : data.refundStatus,
            price: data.price,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            review: data.Review ? {
                id: data.Review.id,
                rating: data.Review.rating,
                comment: data.Review.comment,
                isStaffResponded: data.Review.isStaffResponded,
                staffResponse: data.Review.staffResponse
            } : null
        }))

        return res.status(200).json({ 
            success: true,
            message: 'All the appointments',
            data: formatedAppointmentData
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