const bcryptjs = require("bcryptjs");
const Admin = require("../models/adminModel");
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Replace with your actual secret key
// const SECRET_KEY = process.env.SECRET_KEY || '14f7ff16aef504b07c4ff924fa5f6329';

// Create a nodemailer transporter instance
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "dejuanleahhh@gmail.com",
        pass: "wegj kywi atja azvb",
    },
    tls: {
        rejectUnauthorized: false,
    }
});

// Function to send a verification email
const sendVerificationEmail = async (email, token) => {
  try {
      const verificationLink = `http://localhost:8081/verify-email?token=${token}`;
      const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Verify your email address',
          text: `Click the following link to verify your email: ${verificationLink}`
      };

      await transporter.sendMail(mailOptions);
      console.log('Verification email sent successfully.');
  } catch (error) {
      console.error('Error sending verification email:', error);
      throw error; // Re-throw the error for further handling
  }
};


// Function to send a password reset email
const sendPasswordResetEmail = async (email, token) => {
    const resetLink = `http://yourdomain.com/reset-password?token=${token}`;

    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Request',
            text: `Click the following link to reset your password: ${resetLink}`,
        };

        await transporter.sendMail(mailOptions);
        console.log('Password reset email sent successfully.');
    } catch (error) {
        console.error('Error sending password reset email:', error);
    }
};

// Function to register an admin with verification email
exports.registerAdmin = async (req, res) => {
    const { firstName, lastName, email, username, password, confirmPassword, birthdate, address } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
    }

    try {
        const existingAdmin = await Admin.findAdminByEmail(email);
        if (existingAdmin) {
            return res.status(409).json({ message: "This email is already registered." });
        }

        const hashedPassword = await bcryptjs.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString('hex');

        const newAdmin = await Admin.registerAdmin(
            firstName,
            lastName,
            email,
            username,
            hashedPassword,
            birthdate,
            address,
            verificationToken
        );

        // Send verification email
        await sendVerificationEmail(email, verificationToken);

        return res.status(200).json({ message: "Registration successful. Please check your email to verify your account." });
    } catch (error) {
        console.error("Error during registration:", error);
        return res.status(500).json({ message: "Registration failed." });
    }
};

// Function to verify email after user clicks the verification link
exports.verifyEmail = async (req, res) => {
    const { token } = req.query;

    try {
        const admin = await Admin.findAdminByVerificationToken(token);
        if (!admin) {
            return res.status(404).json({ message: "Invalid or expired token" });
        }

        // Mark the admin as verified
        await Admin.verifyAdminEmail(admin.id);
        res.status(200).json({ message: "Email verified successfully. You can now log in." });
    } catch (error) {
        console.error("Error verifying email:", error);
        res.status(500).json({ message: "Error verifying email" });
    }
};

// Function for admin login with JWT generation
exports.loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const admin = await Admin.findAdminByEmail(email);
        if (!admin) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Compare provided password with stored hashed password
        const isMatch = await bcryptjs.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { adminId: admin.id, email: admin.email }, // Payload
            SECRET_KEY, // Secret Key
            { expiresIn: '1h' } // Token Expiry
        );

        res.status(200).json({
            message: 'Login successful',
            adminId: admin.id,
            token,
        });
    } catch (error) {
        console.error('Error in loginAdmin:', error);
        res.status(500).json({ message: 'An error occurred during login' });
    }
};

// Function for retrieving admin dashboard data
exports.dashboard = async (req, res) => {
    const { id } = req.params;

    try {
        const admin = await Admin.getAdminIdByEmail(id);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        res.status(200).json({ admin });
    } catch (error) {
        console.error('Error in dashboard route:', error);
        res.status(500).json({ message: 'An error occurred' });
    }
};

// Function to request a password reset
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const admin = await Admin.findAdminByEmail(email);
        if (!admin) {
            return res.status(404).json({ message: "No admin found with that email" });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const expirationTime = new Date(Date.now() + 3600000); // 1 hour expiration

        await Admin.saveResetToken(admin.id, resetToken, expirationTime);
        await sendPasswordResetEmail(email, resetToken);

        res.status(200).json({ message: "Password reset link sent to your email." });
    } catch (error) {
        console.error("Error during password reset request:", error);
        res.status(500).json({ message: "Error requesting password reset" });
    }
};

// Function to reset the password after following the reset link
exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const admin = await Admin.findAdminByResetToken(token);
        if (!admin || admin.resetTokenExpires < new Date()) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        const hashedPassword = await bcryptjs.hash(newPassword, 10);
        await Admin.updatePassword(admin.id, hashedPassword);

        res.status(200).json({ message: "Password successfully reset." });
    } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({ message: "Error resetting password" });
    }
};
