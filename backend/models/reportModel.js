const db = require('../config/db');

const ReportModel = {
  getAllReports: () => {
    return new Promise((resolve, reject) => {
      db.execute(
        `SELECT 
          r.report_id, 
          s.first_name, 
          s.last_name, 
          s.grade, 
          r.total_present, 
          r.total_absent, 
          r.total_late, 
          r.total_days, 
          r.generated_at 
        FROM 
          report r 
        JOIN 
          students s 
        ON 
          r.student_id = s.student_id;`
      )
        .then(([rows]) => resolve(rows)) // Resolve the Promise with the result
        .catch((error) => reject(error)); // Reject the Promise in case of an error
    });
  },
};

module.exports = ReportModel;
