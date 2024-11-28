const db = require('../config/db'); // Assuming you're using a database connection module

const Attendance = {
  // Fetching attendance records and joining them with students data
  findAll: () => {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT 
          attendance.*, 
          students.first_name, 
          students.last_name, 
          students.grade 
        FROM 
          attendance 
        INNER JOIN 
          students 
        ON 
          attendance.student_id_no = students.student_id_no`,
        (error, results) => {
          if (error) {
            reject(error); // Reject if there is an error
          } else {
            resolve(results); // Resolve with results if query is successful
          }
        }
      );
    });
  },

  // Check if RFID or student ID exists for the same date
  findByRfidAndDate: (rfid_tag, date) => {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM attendance WHERE rfid_tag = ? AND date = ?", 
        [rfid_tag, date],
        (error, results) => {
          if (error) {
            reject(error); // Reject if there is an error
          } else {
            resolve(results.length > 0 ? results[0] : null); // Resolve if a record is found
          }
        }
      );
    });
  },

  // Insert new attendance record
  create: (rfid_tag, student_id_no, date, time_in, time_out, status) => {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO attendance (
          rfid_tag, 
          student_id_no, 
          date, 
          time_in, 
          time_out, 
          status
        ) 
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      db.query(query, [rfid_tag, student_id_no, date, time_in, time_out, status], (err, result) => {
        if (err) {
          reject(err); // Reject if there is an error
        } else {
          resolve({ message: 'Attendance record added successfully!' }); // Resolve with success message
        }
      });
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

module.exports = Attendance;
