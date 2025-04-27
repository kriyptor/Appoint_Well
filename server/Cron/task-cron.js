const cron = require(`node-cron`);
const Appointments = require(`../Models/appointments-model`);
const { processAppointments } = require('../Utils/process-appointments');
const { Op } = require("sequelize");

exports.scheduleTasks = () => {
    cron.schedule('* * * * *', async () => {
        try {
            console.log('Running daily task processing...');

            const currentDate = new Date().toISOString().split('T')[0];
            
            const appointments = await Appointments.findAll({
              where: { 
                status: { [Op.in]: ["scheduled", "rescheduled"] },
                date: {
                    [Op.lte]: currentDate
                } 
            },
            });

            for (const appointment of appointments) {
                await processAppointments(appointment);
            }

            console.log('Task processing completed.');
        } catch (error) {
            console.error('Error in cron job:', error);
        }
    })
}

