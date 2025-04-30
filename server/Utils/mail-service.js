const nodemailer = require(`nodemailer`);
require("dotenv").config();


const transporter = nodemailer.createTransport({
    service: process.env.NODE_MAILER_SERVICE,
    auth: {
        user: process.env.NODE_MAILER_USER, // Your Gmail email address
        pass: process.env.NODE_MAILER_PASSWORD, // App Password (NOT your actual Gmail password)
    },
});

exports.sendMail = async (
    senderName,
    senderEmailId,
    emailSubject,
    appointmentStatus,
    appointmentData
) => {
    try {
        if (!senderEmailId || !emailSubject || !appointmentData) {
             console.error("Email sending failed: Missing required data.");
             return { success: false, message: "Missing required email data" };
        }


        // Use default values for appointment data in case properties are missing
        const serviceName = appointmentData.serviceName || 'N/A';
        const date = appointmentData.date || 'N/A';
        const startTime = appointmentData.startTime || 'N/A';
        const staffName = appointmentData.staffName || 'N/A';
        const price = appointmentData.price || 'N/A';


        const mailOptions = {
            from: process.env.NODE_MAILER_USER, // Sender address
            to: senderEmailId, // Recipient address
            subject: emailSubject, // Subject line
            html: `
                <p>Hi ${senderName || 'There'},</p>
                <p>Your appointment status is: <strong>${appointmentStatus || 'Updated'}</strong></p>
                <hr/>
                <table border="1" style="border-collapse: collapse; width: 100%;">
                    <thead>
                        <tr>
                            <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Appointment Data</th>
                            <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding: 8px; text-align: left; border: 1px solid #ddd;">Chosen Service</td>
                            <td style="padding: 8px; text-align: left; border: 1px solid #ddd;">${serviceName}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; text-align: left; border: 1px solid #ddd;">Appointment Date & Time</td>
                            <td style="padding: 8px; text-align: left; border: 1px solid #ddd;">${date} at ${startTime}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; text-align: left; border: 1px solid #ddd;">Staff Assigned</td>
                            <td style="padding: 8px; text-align: left; border: 1px solid #ddd;">${staffName}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; text-align: left; border: 1px solid #ddd;">Price Paid</td>
                            <td style="padding: 8px; text-align: left; border: 1px solid #ddd;">${price}</td>
                        </tr>
                    </tbody>
                </table>
                <p>Thank you!</p>
            `, 
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", info.messageId);
        // Return success status and messageId
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error("Error sending email:", error); // Log the error
        return { success: false, error: error.message };
    }
};