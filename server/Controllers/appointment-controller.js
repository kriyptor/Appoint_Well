const Services = require(`../Models/services-model`);
const Users = require(`../Models/users-model`);
const Appointments = require(`../Models/appointments-model`);
const UserWallet = require(`../Models/user-wallet-model`);
const db = require(`../Utils/database`);
const { v4: uuidv4 } = require('uuid');

/* -----------User Appointment Controllers------------- */

exports.userCreateAppointment = async (req, res) => {
    try {

        const userId = req.user.id;

        const { serviceId, date, startTime, price, paymentStatus } = req.body;

        if(!serviceId || !date || !startTime || !price || !paymentStatus){
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        };

        //TODO: Add confirmation mail service

        const newAppointment = await Appointments.create({
            id: uuidv4(),
            date: date,
            startTime: startTime,
            price: price,
            paymentStatus: paymentStatus,
            userId: userId,
            serviceId: serviceId
        });


        return res.status(201).json({ 
            success: true,
            message: 'A new appointment is created',
            data: newAppointment
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


exports.getAllUserAppointments = async (req, res) => {
    try {

        const userId = req.user.id;

        const allAppointment = await Appointments.findAll({ where : { userId: userId } });

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

        if (appointment.status === 'rescheduled') {
            return res.status(400).json({
              success: false,
              message: 'Appointment is already rescheduled'
            });
          } else if (appointment.status === 'canceled') {
            return res.status(400).json({
              success: false,
              message: 'Appointment is already canceled'
            });
          }

          //TODO:Add policy to reschdule before a threshold time

          //TODO: Add rescheduled mail service

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
            return res.status(404).json({
                success: false,
                message: `No Appointment Found with id: ${appointmentId}`
            });
        }

        if (appointment.status === 'canceled') {
            return res.status(400).json({
                success: false,
                message: 'Appointment is already canceled'
            });
        }

        appointment.status = 'canceled';
        await appointment.save({ transaction });

        await Users.increment('walletBalance', {
            by: appointment.price,
            where: { id: userId },
            transaction
        });

        transaction.commit();

        return res.status(200).json({
            success: true,
            message: 'Appointment canceled successfully',
            data: appointment
        });

    } catch (error) {
        transaction.rollback();
        console.error(error)
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

        if (appointment.status === 'rescheduled') {
            return res.status(400).json({
              success: false,
              message: 'Appointment is already rescheduled'
            });
          } else if (appointment.status === 'canceled') {
            return res.status(400).json({
              success: false,
              message: 'Appointment is already canceled'
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

        if (appointment.status === 'canceled') {
            return res.status(400).json({
                success: false,
                message: 'Appointment is already canceled'
            });
        }

        appointment.status = 'canceled';
        await appointment.save();

        return res.status(200).json({
            success: true,
            message: 'Appointment canceled successfully',
            data: appointment
        });

    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}