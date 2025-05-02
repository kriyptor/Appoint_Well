const nodemailer = require('nodemailer');
require("dotenv").config();

exports.sendMail = async (
    senderName,
    senderEmailId,
    emailSubject,
    appointmentStatus,
    appointmentData = {}  // Make appointmentData optional with default empty object
) => {
    try {
        // Validate environment variables
        if (!process.env.NODE_MAILER_SERVICE || !process.env.NODE_MAILER_USER || !process.env.NODE_MAILER_PASSWORD) {
            throw new Error("Missing email configuration in environment variables");
        }

        // Validate required parameters
        if (!senderEmailId || !emailSubject) {
            throw new Error("Missing required email parameters");
        }

        // Create transporter with logging
        console.log("Creating transporter with service:", process.env.NODE_MAILER_SERVICE);
        const transporter = nodemailer.createTransport({
            service: process.env.NODE_MAILER_SERVICE,
            auth: {
                user: process.env.NODE_MAILER_USER,
                pass: process.env.NODE_MAILER_PASSWORD,
            },
        });

        // Verify transporter connection
        await transporter.verify();
        console.log("Transporter verified successfully");

        // Use default values for appointment data
        const {
            serviceName = 'N/A',
            date = 'N/A',
            startTime = 'N/A',
            staffName = 'N/A',
            price = 'N/A'
        } = appointmentData;

        const mailOptions = {
            from: `"AppointWell" <${process.env.NODE_MAILER_USER}>`,
            to: senderEmailId,
            subject: emailSubject,
            html: ` 
                <p>Hi ${senderName || 'There'},</p>
                <p>Your appointment status is: <strong>${appointmentStatus || 'Updated'}</strong></p>

                ${appointmentStatus.toLowerCase() === 'cancelled' ? 
                        (appointmentData.refundStatus ? 
                            `<div style="margin: 15px 0; padding: 12px; border: 2px solid #28a745; border-radius: 4px; background-color: #f8f9fa; color: #155724;">
                                <h5 style="margin: 0;">
                                    Your appointment has been cancelled successfully and we have 
                                    <strong>refunded the amount: ₹${price}</strong>
                                </h5>
                            </div>` : 
                            `<div style="margin: 15px 0; padding: 12px; border: 2px solid #dc3545; border-radius: 4px; background-color: #f8f9fa; color: #721c24;">
                                <h5 style="margin: 0;">
                                    Your appointment has been cancelled successfully. 
                                    However, according to our policy, we are unable to process a refund.
                                </h5>
                            </div>`
                        )
                     : ``
                }

                ${appointmentStatus.toLowerCase() === 'rescheduled' ? 
                    `<div style="
                        margin: 15px 0;
                        padding: 12px;
                        border: 2px solid #28a745;
                        border-radius: 4px;
                        background-color: #f8f9fa;
                        color: #155724;
                    ">
                        <h5 style="margin: 0;">
                            Your appointment has been rescheduled successfully, Your new appointment details are:
                            <strong>Appointment Date: ${date}</strong><br/>
                            <strong>Appointment Time: ${startTime}</strong><br/>
                        </h5>
                    </div>` : ``
                }

                <hr/>
                <p>Here are the details of your appointment:</p>
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
                            <td style="padding: 8px; text-align: left; border: 1px solid #ddd;">₹${price}</td>
                        </tr>
                    </tbody>
                </table>
                <p>Thank you for choosing AppointWell!</p>
            `,
        };

        console.log("Attempting to send email to:", senderEmailId);
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", info.messageId);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error("Detailed error sending email:", error);
        return { success: false, error: error.message };
    }
};