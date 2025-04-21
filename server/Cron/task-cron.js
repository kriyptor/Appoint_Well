const cron = require(`node-cron`);
const Appointments = require(`../Models/appointments-model`);
const { processAppointments } = require('../Utils/process-appointments');
const { Op } = require("sequelize");

exports.scheduleTasks = () => {
    cron.schedule('0 0 * * *', async () => {
        try {
            console.log('Running daily task processing...');

            const appointments = Appointments.findAll({
              where: { status: { [Op.in]: ["scheduled", "rescheduled"] } },
            });

            appointments.forEach(appntData => {
                processAppointments(appntData);
            });

            console.log('Task processing completed.');
        } catch (error) {
            console.error('Error in cron job:', error);
        }
    })
}

