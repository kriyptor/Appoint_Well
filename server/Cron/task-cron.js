const cron = require(`node-cron`);
const { Op } = require("sequelize");
const Users = require('../Models/users-model');
const Appointments = require(`../Models/appointments-model`);
const { sendRemainder } = require('../Utils/process-remainder');
const { processAppointments } = require('../Utils/process-appointments');

const cronSchedule = '0 0 * * *'; // Run at 12:00 AM (midnight) daily

exports.scheduleTasks = () => {
    cron.schedule(cronSchedule, async () => {
        try {
            console.log('Running daily task processing...');

            const currentDate = new Date().toISOString().split('T')[0];
            const tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            /* ------------------------Appointment Processing Job------------------------------ */

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


            /* ------------------------Reaminder Mail Job------------------------------ */

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

            for (const appointment of formatedData) {
                try {
                    await sendRemainder(appointment);
                    console.log(`Reminder email sent for appointment ID: ${appointment.id}`);
                } catch (sendError) {
                    console.error(`Error sending reminder for appointment ID: ${appointment.id}`, sendError);
                }
            }

            console.log('Task processing completed.');

        } catch (error) {
            console.error('Error in cron job:', error);
        }
    })
}

