exports.processAppointments = async (appointment) => {
    try {
        const currentDate = new Date().toISOString().split('T')[0];
        
        if(appointment.date === currentDate) {
            appointment.status = 'completed';
            await appointment.save();
        }
        else if (new Date(appointment.date) < new Date(currentDate)) {
            appointment.status = 'unattained';
            await appointment.save();
        }
        console.log(`Processed task: ${appointment.id}`);
    } catch (error) {
        console.error(`Error processing task ${appointment.id}:`, error);
    }
}