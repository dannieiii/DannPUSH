const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// Get all students
router.get('/studentrecord', studentController.getAllStudents);

// Create a new student
router.post('/students', studentController.createStudent);
router.get('/check-rfid/:rfid', studentController.checkRfidTagExists);

// Time-in a student
router.post('/timein', studentController.timeInStudent);

// Update student details
router.put('/:id', studentController.updateStudent);

// Get student by ID
router.get('/:id', studentController.getStudentById);

// Level up selected students
router.put('/levelup/:id', studentController.levelUpStudents);

module.exports = router;
