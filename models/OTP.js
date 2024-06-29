const mongoose = require("mongoose");
const schema = mongoose.Schema;

const otpSchema = new schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300 // The OTP will be automatically deleted after 5 minutes
    }
});

module.exports = mongoose.model('OTP', otpSchema);
