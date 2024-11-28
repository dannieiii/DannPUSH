const db = require('../config/db');
const bcryptjs = require('bcryptjs');
const crypto = require('crypto');

// Function to register an admin
const registerAdmin = (firstName, lastName, email, username, password, birthdate, address) => {
    return new Promise((resolve, reject) => {
        bcryptjs.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                return reject('Error hashing password');
            }

            const verificationToken = crypto.randomBytes(20).toString('hex'); // Create verification token

            const sqlQuery = `
                INSERT INTO admin (firstName, lastName, email, username, password, birthdate, address, verificationToken)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            db.query(sqlQuery, [firstName, lastName, email, username, hashedPassword, birthdate, address, verificationToken], (err, results) => {
                if (err) {
                    console.error('Database query error:', err);
                    return reject('Error inserting admin into database');
                }
                resolve({ message: 'Admin registered successfully', verificationToken });
            });
        });
    });
};

// Function to find an admin by email
const findAdminByEmail = (email) => {
    return new Promise((resolve, reject) => {
        const sqlQuery = 'SELECT * FROM admin WHERE email = ?';
        db.query(sqlQuery, [email], (err, results) => {
            if (err) {
                console.error('Database query error:', err);
                return reject('Error fetching admin data by email');
            }
            resolve(results[0] || null); // Return admin or null if not found
        });
    });
};

// Function to find an admin by username
const findAdminByUsername = (username) => {
    return new Promise((resolve, reject) => {
        const sqlQuery = 'SELECT * FROM admin WHERE username = ?';
        db.query(sqlQuery, [username], (err, results) => {
            if (err) {
                console.error('Database query error:', err);
                return reject('Error fetching admin data by username');
            }
            resolve(results[0]); // Return the first result (admin)
        });
    });
};

// Function to compare passwords
const getPasswordByEmail = (email) => {
    return new Promise((resolve, reject) => {
        const sqlQuery = 'SELECT password FROM admin WHERE email = ?';
        db.query(sqlQuery, [email], (err, results) => {
            if (err) {
                console.error('Database query error:', err);
                return reject('Error fetching password from database');
            }
            resolve(results[0]?.password || null); // Return the password or null if not found
        });
    });
};

// Get admin id by email
const getAdminIdByEmail = (email) => {
    return new Promise((resolve, reject) => {
        const sqlQuery = 'SELECT id FROM admin WHERE email = ?';
        db.query(sqlQuery, [email], (err, results) => {
            if (err) {
                console.error('Database query error:', err);
                return reject('Error fetching admin ID by email');
            }
            resolve(results[0]?.id || null); // Return the ID or null if not found
        });
    });
};

// Find an admin by verification token
const findAdminByVerificationToken = (token) => {
    return new Promise((resolve, reject) => {
        const sqlQuery = 'SELECT * FROM admin WHERE verificationToken = ?';
        db.query(sqlQuery, [token], (err, results) => {
            if (err) return reject('Error fetching admin by token');
            resolve(results[0] || null);
        });
    });
};

// Verify admin email
const verifyAdminEmail = (adminId) => {
    return new Promise((resolve, reject) => {
        const sqlQuery = 'UPDATE admin SET isVerified = 1, verificationToken = NULL WHERE id = ?';
        db.query(sqlQuery, [adminId], (err, results) => {
            if (err) return reject('Error verifying admin email');
            resolve();
        });
    });
};

// Save reset token
const saveResetToken = (adminId, token, expirationTime) => {
    return new Promise((resolve, reject) => {
        const sqlQuery = 'UPDATE admin SET resetToken = ?, resetTokenExpires = ? WHERE id = ?';
        db.query(sqlQuery, [token, expirationTime, adminId], (err, results) => {
            if (err) return reject('Error saving reset token');
            resolve();
        });
    });
};

// Find admin by reset token
const findAdminByResetToken = (token) => {
    return new Promise((resolve, reject) => {
        const sqlQuery = 'SELECT * FROM admin WHERE resetToken = ?';
        db.query(sqlQuery, [token], (err, results) => {
            if (err) return reject('Error fetching admin by reset token');
            resolve(results[0] || null);
        });
    });
};

// Update password
const updatePassword = (adminId, hashedPassword) => {
    return new Promise((resolve, reject) => {
        const sqlQuery = 'UPDATE admin SET password = ?, resetToken = NULL, resetTokenExpires = NULL WHERE id = ?';
        db.query(sqlQuery, [hashedPassword, adminId], (err, results) => {
            if (err) return reject('Error updating password');
            resolve();
        });
    });
};

// Export all functions as named exports
module.exports = {
    registerAdmin,
    findAdminByEmail,
    findAdminByUsername,
    getPasswordByEmail,
    getAdminIdByEmail,
    findAdminByVerificationToken,
    verifyAdminEmail,
    saveResetToken,
    findAdminByResetToken,
    updatePassword
};
