require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

transporter.verify(function (error, success) {
    if (error) {
        console.log("Connection Error:", error);
    } else {
        console.log("Server is ready to take our messages");
        
        // Try sending a test email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Send to self
            subject: 'SMTP Test from Voxiq',
            text: 'If you receive this, SMTP is working perfectly!'
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log("Send Error:", err);
            } else {
                console.log("Email sent successfully:", info.response);
            }
        });
    }
});
