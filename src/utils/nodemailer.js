import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    auth: {
        user: emailUser,
        pass: emailPass
    }
});

export default transporter;
