const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
 service: 'gmail', // Use Gmail for this example
 auth: {
    user: '@gmail.com', // Your email address
    pass: '' // Your email password
 }
});

module.exports = transporter;
