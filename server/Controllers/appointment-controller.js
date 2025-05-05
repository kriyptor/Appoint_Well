const Services = require(`../Models/services-model`);
const Users = require(`../Models/users-model`);
const Revenue = require(`../Models/revenue-model`);
const Appointments = require(`../Models/appointments-model`);
const StaffService = require(`../Models/staff-service-model`);
const Staffs = require(`../Models/staffs-model`);
const Reviews = require('../Models/reviews-model');
const { timeDifferenceValidation, convertDateFormat } = require(`../Utils/utility-functions`);
const { sendMail } = require(`../Utils/mail-service`);
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

        const { name, email } = req.user;
        
        /* // Format appointment data for email
        const emailAppointmentData = {
            serviceName: service.title,
            date: formattedDate,
            startTime: startTime,
            staffName: selectedStaffName,
            price: `₹${price}`
        };
 */
        // Validate email data
        if (!name || !email) {
            console.warn('Missing user email information:', { name, email });
            // Continue with appointment creation but log the warning
        } else {
            try {
                const emailSubject = `Appointment Confirmation - ${service.title}`;
                const result = await sendMail(
                    name,
                    email,
                    emailSubject,
                    'scheduled',
                    newAppointmentData
                );

                if (!result.success) {
                    console.error('Failed to send confirmation email:', result.error);
                    // Don't throw error, just log it and continue
                } else {
                    console.log('Confirmation email sent successfully:', result.messageId);
                }
            } catch (emailError) {
                console.error('Error sending confirmation email:', emailError);
                // Don't throw error, allow appointment creation to continue
            }
        }

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

        const { name, email } = req.user;

        const emailRescheduledAppointmentData = {
            serviceName: appointment.serviceName,
            date: date,
            startTime: startTime,
            staffName: appointment.staffName,
            price: appointment.price,
        };

        if (!name || !email) {
            console.warn('Missing user email information:', { name, email });
        }
        else {
            try {
                const emailSubject = `Appointment Rescheduled - ${appointment.serviceName}`;
               
                const result = await sendMail(
                    name,
                    email,
                    emailSubject,
                    'rescheduled',
                    emailRescheduledAppointmentData
                );

                if (!result.success) {
                    console.error('Failed to send rescheduled email:', result.error);
                } else {
                    console.log('rescheduled email sent successfully:', result.messageId);
                }
            } catch (emailError) {
                console.error('Error sending rescheduled email:', emailError);
            }
        }

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
           
            appointment.refundStatus = true;
            await appointment.save({ transaction });
            
            refundStatus = "Refund Processed";
        }

        // Update appointment status
        appointment.status = 'canceled';
        await appointment.save({ transaction });

        await transaction.commit();

        // Send cancellation email
        const { name, email } = req.user;

        const emailCancelledAppointmentData = {
            serviceName: appointment.serviceName,
            date: appointment.date,
            startTime: appointment.startTime,
            staffName: appointment.staffName,
            price: appointment.price,
            refundStatus: appointment.refundStatus
        };

        if (!name || !email) {
            console.warn('Missing user email information:', { name, email });
        }
        else {
            try {
                const emailSubject = `Appointment Cancellation - ${appointment.serviceName}`;
                const result = await sendMail(
                    name,
                    email,
                    emailSubject,
                    'cancelled',
                    emailCancelledAppointmentData
                );

                if (!result.success) {
                    console.error('Failed to send cancellation email:', result.error);
                } else {
                    console.log('Cancellation email sent successfully:', result.messageId);
                }
            } catch (emailError) {
                console.error('Error sending cancellation email:', emailError);
            }
        }

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

        const page = parseInt(req.query.page || 1);
        const limit = parseInt(req.query.limit || 5);
        const offset = (page - 1) * limit;

        const userId = req.user.id;
        const currentDate = new Date().toISOString().split('T')[0];
        
        const { count, rows: allAppointment } = await Appointments.findAndCountAll({
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
        limit: limit,
        offset: offset,
        order : [['date', 'DESC']]
        });

        const totalPages = Math.ceil(count / limit);
        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;

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
            data: formatedAppointmentData,
            pagination : {
                currentPage : page,
                itemsPerPage : limit,
                totalItems : count,
                totalPages : totalPages,
                hasNextPage : hasNextPage,
                hasPrevPage : hasPreviousPage
            }
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




/*------------Admin Appointment Controllers-------------*/

exports.getAllUpcomingAppointments = async (req, res) => {
    try {

        const page = parseInt(req.query.page || 1);
        const limit = parseInt(req.query.limit || 5);
        const offset = (page - 1) * limit;

        const { count, rows: allAppointment } = await Appointments.findAndCountAll({
            where: { [Op.or]: [{ status: 'scheduled' }, { status: 'rescheduled' }] },
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
            limit: limit,
            offset: offset,
            order : [['date', 'DESC']]
        });

        const totalPages = Math.ceil(count / limit);
        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;
       

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
            data: formatedAppointmentData,
            pagination : {
                currentPage : page,
                itemsPerPage : limit,
                totalItems : count,
                totalPages : totalPages,
                hasNextPage : hasNextPage,
                hasPrevPage : hasPreviousPage
            }
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

        const page = parseInt(req.query.page || 1);
        const limit = parseInt(req.query.limit || 5);
        const offset = (page - 1) * limit;

        const { count, rows: allAppointment } = await Appointments.findAndCountAll({
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
            limit: limit,
            offset: offset,
            order : [['date', 'DESC']]
        });

        const totalPages = Math.ceil(count / limit);
        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;

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
            data: formatedAppointmentData,
            pagination : {
                currentPage : page,
                itemsPerPage : limit,
                totalItems : count,
                totalPages : totalPages,
                hasNextPage : hasNextPage,
                hasPrevPage : hasPreviousPage
            }
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

        const page = parseInt(req.query.page || 1);
        const limit = parseInt(req.query.limit || 5);
        const offset = (page - 1) * limit;

        const { count, rows: allAppointment } = await Appointments.findAndCountAll({
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
            limit: limit,
            offset: offset,
          order : [['date']]
        });

        const totalPages = Math.ceil(count / limit);
        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;

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
            data: formatedAppointmentData,
            pagination : {
                currentPage : page,
                itemsPerPage : limit,
                totalItems : count,
                totalPages : totalPages,
                hasNextPage : hasNextPage,
                hasPrevPage : hasPreviousPage
            }
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

        const page = parseInt(req.query.page || 1);
        const limit = parseInt(req.query.limit || 5);
        const offset = (page - 1) * limit;


        const staffId = req.staff.id;
        const currentDate = new Date().toISOString().split('T')[0];
        
        const { count, rows: allAppointment } = await Appointments.findAndCountAll({
          where: { staffId: staffId, [Op.or] : [{ date: { [Op.lt]: currentDate }, status : 'completed' }] },
          include:[
            {
            model : Users,
            attributes: ['name','profilePicture'],
            },

            {
                model: Reviews
            }
        ],
        limit: limit,
        offset: offset,
        order : [['date', 'DESC']]
        });

        const totalPages = Math.ceil(count / limit);
        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;

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
            data: formatedAppointmentData,
            pagination : {
                currentPage : page,
                itemsPerPage : limit,
                totalItems : count,
                totalPages : totalPages,
                hasNextPage : hasNextPage,
                hasPrevPage : hasPreviousPage
            }
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


/* exports.getAppoint = async (req, res) => {
    try {

        const tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const reminderAppointments = await Appointments.findAll({
            where: {
                status: { [Op.in]: ["scheduled", "rescheduled"] },
                date: { [Op.eq]: tomorrow }
            },
            include: [{
                model: Users,
                required: true,
                attributes: ['name', 'email']
            }],
            attributes: [
                'id', 'status', 'date', 'startTime', 'serviceId',
                'serviceName', 'staffId', 'staffName', 'userId',
                'refundStatus', 'price'
            ]
        });

        const formatedData = reminderAppointments.map((data) => ({
            id: data.id,
            status: data.status,
            date: data.date,
            startTime: data.startTime,
            serviceId: data.serviceId,
            serviceTitle: data.serviceName,
            staff: data.staffId,
            staffName: data.staffName,
            userId: data.userId,
            userName: data.User ? data.User.name : 'Unknown User',
            userEmail: data.User ? data.User.email : 'unknown@example.com',
            refundStatus: data.refundStatus,
            price: data.price,
        }));

        return res.status(200).json({ 
            success: true,
            message: 'All Staffs',
            data: formatedData
        });

        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
} */