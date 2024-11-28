const Student = require('../models/studentModel');
const Attendance = require('../models/attendanceModel'); // Add this line to import the Attendance model

const studentController = {
  // Get all students
  getAllStudents: (req, res) => {
    Student.getAllStudentRecord((err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
  },

  // Create a new student
  createStudent: (req, res) => {
    const newStudent = req.body;
    // Check if RFID tag already exists
    Student.checkRfidTagExists(newStudent.rfid_tag, (err, exists) => {
      if (err) return res.status(500).json({ error: err.message });
      if (exists) {
        return res.status(400).json({ error: 'RFID tag already exists. Please use a unique RFID tag.' });
      }

      // Proceed to create the student if RFID tag is unique
      Student.createStudent(newStudent, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Student added successfully', studentId: result.insertId });
      });
    });
  },


  // Check if RFID tag exists
  checkRfidTagExists: (rfidTag, callback) => {
    Student.checkRfidTagExists(rfidTag, (err, exists) => {
      if (err) return callback(err);
      callback(null, exists);
    });
  },

  timeInStudent: async (req, res) => {
    const { rfid_tag } = req.body;
  
    if (!rfid_tag) {
      return res.status(400).json({ error: 'RFID tag is required' });
    }
  
    try {
      const student = await Student.getStudentByRfid(rfid_tag);
      if (!student) {
        return res.status(404).json({ error: 'Student not registered. Please register first.' });
      }
  
      const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const currentTime = new Date();
      const time = currentTime.toTimeString().split(' ')[0]; // HH:MM:SS format
  
      const existingRecord = await Attendance.findByRfidAndDate(rfid_tag, date);
  
      if (existingRecord) {
        // If a time-in exists but no time-out yet, update the time-out field
        if (existingRecord.time_out === null) {
          await Attendance.updateTimeOut(rfid_tag, date, time)
            .then(() => {
              res.json({
                message: 'Time-out recorded successfully.',
                timeOut: time,
                status: existingRecord.status, // Keep the existing status
              });
            })
            .catch((error) => {
              console.error('Error updating time-out:', error);
              res.status(500).json({ error: 'Failed to update time-out.' });
            });
        } else {
          res.status(400).json({ error: 'Time-out already recorded for today.' });
        }
      } else {
        // Create a new attendance record for time-in
        const status = currentTime.getHours() < 8 ? 'Present' : 'Late';
        await Attendance.create(rfid_tag, student.student_id_no, date, time, null, status);
  
        res.json({
          studentName: `${student.first_name} ${student.last_name}`,
          timeIn: time,
          status: status,
        });
      }
    } catch (err) {
      console.error('Error processing time-in or time-out:', err);
      res.status(500).json({ error: 'An error occurred. Please try again later.' });
    }
  },
  


  // Get student by ID
  getStudentById: (req, res) => {
    const studentId = req.params.id;
    Student.getStudentById(studentId, (err, student) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!student) return res.status(404).json({ error: 'Student not found' });
      res.json(student);
    });
  },

  // Update student details
  updateStudent: (req, res) => {
    const studentId = req.params.id;
    const updatedStudent = req.body;

    Student.updateStudent(studentId, updatedStudent, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Student not found' });
      }
      res.json({ message: 'Student updated successfully' });
    });
  },

  // Level up students to a specific grade
  levelUpStudents: (req, res) => {
    const { students, newGrade } = req.body; // Expecting an array of student IDs and a new grade

    // Validate input
    if (!students || students.length === 0) {
      return res.status(400).json({ message: 'No students selected for leveling up.' });
    }
    if (!newGrade) {
      return res.status(400).json({ message: 'New grade is required.' });
    }

    Student.promoteStudents(students, newGrade, (err, result) => {
      if (err) {
        console.error('Error leveling up students:', err);
        return res.status(500).json({ message: 'Failed to level up students.' });
      }
      res.json({ message: 'Students leveled up successfully.', result });
    });
  },
};

module.exports = studentController;
