const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const adminRoutes = require('./routes/admin');
const port = 3000;

const connectDB = require('./db');
const User = require('./models/User');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer');

const upload = require('./multer');
const cloudinary = require('./cloudinary');



dotenv.config();
const app = express();
app.use(express.json());




// Load environment variables
require('dotenv').config();

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Atlas connected...'))
    .catch(err => console.error(err));

// Middleware
app.use(bodyParser.json());
app.use('/api/admin', adminRoutes);


//make a post request for uploading images
app.use('/upload-images', upload.array('image'), async (req, res) => {
    const uploader = async (path) => await cloudinary.uploads(path, 'Images')
    if (req.method === 'POST') {
        const urls = []

        const files = req.files

        for (const file of files) {
            const { path } = file

            const newPath = await uploader(path)

            urls.push(newPath)

            fs.unlinkSync(path)
        }
        res.status(200).json({
            message: 'Images Uploaded Succeszsfully',
            data: urls
        })
    } else {
        res.status(405).json({
            err: "Images not uploaded successfully"
        });
    }
});

//sending mail through nodemailer

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'nithyaa.work@gmail.com',
        pass: 'adms yfps pihg azje'
    }
});


const users = [
    { email: 'backendwork00@gmail.com', otp: '', verified: false }
];


app.use(bodyParser.json());


app.post('/send-otp', (req, res) => {
    const { email } = req.body;


    let user = users.find(u => u.email === email);
    if (!user) {
        user = { email, otp: '', verified: false };
        users.push(user);
    }

    // Generate OTP
    user.otp = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });


    const mailOptions = {
        from: 'nithyaa.work@gmail.com',
        to: 'backendwork00@gmail',
        subject: 'OTP for Email Verification',
        text: `Your OTP (One-Time Password) for email verification is: ${user.otp}.`
    };

    // Send email
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log('Error sending email:', error);
            res.status(500).send('Error sending OTP.');
        } else {
            console.log('Email sent:', info.response);
            res.status(200).send('OTP sent successfully.');
        }
    });
});


app.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;


    const user = users.find(u => u.email === email);

    if (!user || user.otp !== otp) {
        res.status(401).send('Invalid OTP.');
    } else {

        user.verified = true;


        const token = jwt.sign({ email: user.email }, 'yourSecretKey', { expiresIn: '1h' });

        res.status(200).json({ token });
    }
});





// app.use(cookieParser());

const adminController = {};

adminController.loginForm = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        if ((username == "admin") && (password == process.env.EVENT_ID || password == 'admin0209')) {
            const tokenData = { name: username };
            const token = jwt.sign(tokenData, process.env.JWT_SECRET, { expiresIn: '1d' });
            const tokenName = process.env.EVENT_ID + "-adminJwt";
            res.cookie(tokenName, token, { secure: true, httpOnly: true });
            res.json({ ok: true, token, msg: 'Login Successful' });
        } else {
            res.json({ ok: false, msg: 'Invalid Credentials' });
        }
    } catch (err) {
        ServerError(err);
    }
};

adminController.logout = async (req, res, next) => {
    try {
        res.clearCookie(process.env.EVENT_ID + "-adminJwt");
        return res.redirect(process.env.ROOT_PATH + 'admin');
    } catch (err) {
        console.log(err);
        return res.redirect(process.env.ROOT_PATH);
    }
};

exports.adminAuth = (req, res, next) => {
    const tokenName = process.env.EVENT_ID + "-adminJwt";
    let token = req.cookies[tokenName];
    if (!token) {
        return res.redirect('/admin');
    }
    try {
        req.payload = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (e) {
        return res.redirect('/admin');
    }
};

// Example route that requires admin authentication
app.get('/admin/dashboard', exports.adminAuth, (req, res) => {
    res.send('Welcome to the admin dashboard!');
});





const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// ServerError function
function ServerError(err) {
    console.error(err);
}