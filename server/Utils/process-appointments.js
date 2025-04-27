exports.processAppointments = async (appointment) => {
    try {
        // Update status to completed
        appointment.status = 'completed';
        await appointment.save();
        console.log(`Appointment ${appointment.id} marked as completed`);
    } catch (error) {
        console.error(`Error processing appointment ${appointment.id}:`, error);
    }
};