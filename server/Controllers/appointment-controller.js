const Services = require(`../Models/services-model`);
const Users = require(`../Models/users-model`);
const Revenue = require(`../Models/revenue-model`);
const Appointments = require(`../Models/appointments-model`);
const { timeDifferenceValidation, convertDateFormat } = require(`../Utils/utility-functions`);
const db = require(`../Utils/database`);
const { v4: uuidv4 } = require('uuid');

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

        const newAppointmentData = {
            id: newApptId,
            date: formattedDate,
            startTime: startTime,
            price: price,
            paymentStatus: paymentStatus,
            userId: userId,
            serviceId: serviceId
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

exports.getAllUserAppointments = async (req, res) => {
    try {

        const userId = req.user.id;

        const allAppointment = await Appointments.findAll({
          where: { userId: userId },
          order : [['createdAt', 'DESC']]
        });

        return res.status(200).json({ 
            success: true,
            message: 'All the appointments',
            data: allAppointment
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



/* -----------Admin Appointment Controllers------------- */

exports.getAllAppointments = async (req, res) => {
    try {

        const allAppointment = await Appointments.findAll();

        return res.status(200).json({ 
            success: true,
            message: 'All the appointments',
            data: allAppointment
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