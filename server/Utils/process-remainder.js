const { sendMail } = require("./mail-service");

exports.sendRemainder = async (appointment) => {
    try {
        await sendMail(
            appointment.userName,
            appointment.userEmail,
            `Appointment Reminder`,
            appointment.status,
            {
                serviceName: appointment.serviceTitle,
                date: appointment.date,
                startTime: appointment.startTime,
                staffName: appointment.staffName,
                price: appointment.price
            }
        );

        console.log(`Reminder sent to ${appointment.userName} for appointment on ${appointment.date}`);

    } catch (error) {
        console.error(`Error sending remainder for appointment ${appointment.id}:`, error);
        throw error; // Re-throw the error so it's caught in the cron job
    }
}