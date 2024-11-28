const db = require('../config/db'); // Assuming you're using a database connection module

const Student = {
  // Get all students
  getAllStudentRecord: (callback) => {
    const query = 'SELECT * FROM students';
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching students: ', err);
        return callback(err, null);
      }
      callback(null, results);
    });
  },

  // Check if RFID tag exists
  checkRfidTagExists: (rfid_tag, callback) => {
    const query = 'SELECT COUNT(*) AS count FROM students WHERE rfid_tag = ?';
    db.query(query, [rfid_tag], (err, results) => {
      if (err) return callback(err, null);
      callback(null, results[0].count > 0); // Returns true if the RFID tag exists
    });
  },

  // Create a new student
  createStudent: (student, callback) => {
    const query = `
      INSERT INTO students (student_id_no, rfid_tag, first_name, middle_name, last_name, age, gender, grade, contact, address, email)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      student.student_id_no,
      student.rfid_tag,
      student.first_name,
      student.middle_name,
      student.last_name,
      student.age,
      student.gender,
      student.grade,
      student.contact,
      student.address,
      student.email,
    ];
    db.query(query, values, callback);
  },

  // Time-in a student
  timeInStudent: (rfid_tag, callback) => {
    const currentTime = new Date();
    const date = currentTime.toISOString().split('T')[0]; // Date in YYYY-MM-DD format
    const time = currentTime.toTimeString().split(' ')[0]; // Time in HH:MM:SS format
    const status = currentTime.getHours() < 8 ? 'Present' : 'Late'; // Status based on time

    const query = `
      INSERT INTO attendance (rfid_tag, date, time, status)
      VALUES (?, ?, ?, ?)
    `;
    const values = [rfid_tag, date, time, status];

    db.query(query, values, (err, result) => {
      if (err) {
        console.error('Error recording time-in: ', err);
        return callback(err, null);
      }
      callback(null, result);
    });
  },

  getStudentByRfid: (rfid_tag) => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM students WHERE rfid_tag = ?';
      db.query(query, [rfid_tag], (err, results) => {
        if (err) {
          reject(err); // Reject the promise if there is an error
        } else {
          resolve(results[0]); // Resolve the promise with the student data
        }
      });
    });
  },
  

  // Get student by ID
  getStudentById: (studentId, callback) => {
    const query = 'SELECT * FROM students WHERE student_id = ?';
    db.query(query, [studentId], (err, results) => {
      if (err) return callback(err, null);
      callback(null, results.length > 0 ? results[0] : null);
    });
  },

  // Update student details
  updateStudent: (studentId, updatedStudent, callback) => {
    const query = `
      UPDATE students
      SET student_id_no = ?, rfid_tag = ?, first_name = ?, middle_name = ?, last_name = ?, age = ?, gender = ?, grade = ?, contact = ?, address = ?, email = ?, status = ?
      WHERE student_id = ?
    `;
    const values = [
      updatedStudent.student_id_no,
      updatedStudent.rfid_tag,
      updatedStudent.first_name,
      updatedStudent.middle_name,
      updatedStudent.last_name,
      updatedStudent.age,
      updatedStudent.gender,
      updatedStudent.grade,
      updatedStudent.contact,
      updatedStudent.address,
      updatedStudent.email,
      updatedStudent.status || 'active', // Default status is 'active'
      studentId,
    ];
    db.query(query, values, callback);
  },

  // Promote students
  promoteStudents: (studentIds, newGrade, callback) => {
    const placeholders = studentIds.map(() => '?').join(', ');
    const query = `UPDATE students SET grade = ? WHERE student_id IN (${placeholders})`;
    db.query(query, [newGrade, ...studentIds], (err, result) => {
      if (err) {
        console.error('Error promoting students:', err);
        return callback(err, null);
      }
      callback(null, result);
    });
  },
  
  updateTimeOut: async (rfid_tag, date, timeOut) => {
  const sql = `
    UPDATE attendance 
    SET time_out = ? 
    WHERE rfid_tag = ? AND date = ? AND time_out IS NULL
  `;
  return new Promise((resolve, reject) => {
    db.query(sql, [timeOut, rfid_tag, date], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
},

};

module.exports = Student;
