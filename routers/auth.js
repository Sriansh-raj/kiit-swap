const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
// const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const homeSchema = require('../models/homeSchema');
const OTP = require('../models/OTP');
require('dotenv').config();

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOTPEmail = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

const mailOptions = {
    from: `KIIT Swap <${process.env.EMAIL_USER}>`, // Display name and sender email
    to: email, // Recipient email
    subject: 'Your OTP for KIIT Swap Registration', // Email subject
    html: `
<p>Dear User,</p>

<p>Your One Time Password (OTP) for KIIT Swap registration is: <strong>${otp}</strong></p>

<p>This OTP is valid for only 5 minutes. Please do not share this OTP with anyone.</p>

<p>Please note that the OTP is valid for only one session. If you refresh the page or leave the KIIT Swap portal, you will need to generate a new OTP.</p>

<p>If you did not request this OTP, please contact us immediately at <a href="mailto:support@kiitswap.com">support@kiitswap.com</a>.</p>

<p>Regards,<br>
KIIT Swap Team<br>
<a href="mailto:support@kiitswap.com">support@kiitswap.com</a></p>

<hr>

<p><em>Notice: The information contained in this e-mail message and/or attachments may contain confidential or privileged information. If you are not the intended recipient, any dissemination, use, review, distribution, printing, or copying of the information contained in this e-mail message and/or attachments is strictly prohibited. If you have received this communication in error, please notify us by reply e-mail or telephone and immediately and permanently delete the message and any attachments. Thank you.</em></p>
`,
};

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

// Register route
router.post('/signup',
    [
        body('email').isEmail().withMessage('Invalid email address'),
        body('password').isLength({ min: 5 }).withMessage('Password must be at least 5 characters long'),
        body('cpassword').custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;
        })
    ],
    async (req, res) => {
        const { name, number, email, need, available, password } = req.body;

        // Validate request body
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: errors.array()[0].msg });
        }

        // Check if the user already exists
        const user = await homeSchema.findOne({ email: email });
        if (user) {
            return res.status(400).json({ success: false, message: "Email already registered" });
        }

        // Generate OTP and save it
        const otp = generateOTP();
        const newOTP = new OTP({ email, otp });
        await newOTP.save();

        // Send OTP email
        const emailSent = await sendOTPEmail(email, otp);
        if (!emailSent) {
            return res.status(500).json({ success: false, message: "Failed to send OTP email" });
        }

        // Temporarily store the user's data in the session for later use
        req.session.tempUser = { name, number, email, need, available, password };

        res.status(200).json({ success: true, message: "OTP sent to your email" });
    }
);

// OTP verification page route
router.get('/verify-otp', (req, res) => {
    const { email } = req.query;
    res.render('verify-otp', { email });
});

// OTP verification route
router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;

    // Find the OTP in the database
    const storedOTP = await OTP.findOne({ email, otp });
    if (!storedOTP) {
        return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Check if the user already exists
    const existingUser = await homeSchema.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
    }

    // OTP is valid, create the user
    const { name, number, need, available, password } = req.session.tempUser;
    // const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new homeSchema({ name, number, email, need, available, password});
    try {
        await newUser.save();
    } catch (error) {
        return res.status(500).json({ message: 'Error saving user' });
    }

    // Delete the OTP record
    await OTP.deleteOne({ email });

    // Clear the tempUser session data
    delete req.session.tempUser;

    res.status(200).json({ message: 'User registered successfully' });
});

module.exports = router;
