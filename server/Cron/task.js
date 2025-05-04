const Appointments = require(`../Models/appointments-model`);
const Users = require('../Models/users-model');
const { Op } = require("sequelize");


async function getUserData() {
    const reminderAppointments = await Appointments.findAll({
        where: { 
            status: { [Op.in]: ["scheduled", "rescheduled"] },
            /* date: {
                [Op.eq]: tomorrow
            }  */
        },

        include : [{
            model: Users,
            attributes: ['email'],
        }]
    });

    console.log('Task processing completed.', reminderAppointments);
}


getUserData();