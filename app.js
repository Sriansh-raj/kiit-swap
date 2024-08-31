const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const nodemailer = require('nodemailer');
const session = require('express-session');
const crypto = require('crypto');
const path = require('path');
const authRouter = require('./routers/auth');
const homeRouter = require('./routers/homeRouter');
const ejs = require("ejs");
const port = process.env.port || 8080;

const app = express();

// Connect Database
mongoose.set('strictQuery', false);
mongoose.connect('mongodb+srv://UserName:password.0aj0duu.mongodb.net/?retryWrites=true&w=majority&appName=KIITSwap', {useNewUrlParser:true});
const db = mongoose.connection;
db.on("error", ()=>{console.log("error");});
db.once("open", ()=>{console.log("connected");});

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static("./public"));

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session middleware
app.use(session({
    secret: '',
    resave: false,
    saveUninitialized: true
}));

// Routes
app.use('/', homeRouter);
app.use('/auth', authRouter);

app.listen(port, () => {
    console.log("Listen on the port 8080");
});

// Set up nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: '@gmail.com',
        pass: ''
    }
});

// Function to generate OTP
function generateOTP() {
    return crypto.randomBytes(3).toString('hex'); // Generate a 6-character OTP
}

// Function to send OTP email
function sendOTPEmail(email, otp) {
    const mailOptions = {
        from: 'bestof5special@gmail.com',
        to: email,
        subject: 'Your OTP for KIIT Swap Registration',
        text: `Your OTP is: ${otp}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}

// Main page route
app.get('/main', (req, res) => {
    // Render main.ejs with title or any data you need
    res.render('main', { title: "KIIT Swap" });
});

module.exports = app;
