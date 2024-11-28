const Attendance = require("../models/attendanceModel");

// Get all attendance records
exports.getAllRecords = async (req, res) => {
  try {
    const records = await Attendance.findAll();
    res.json(records);
  } catch (error) {
    console.error("Error fetching records:", error);
    res.status(500).json({ error: "Unable to retrieve records" });
  }
};

// Create a new attendance record
exports.createAttendanceRecord = async (req, res) => {
  const { rfid_tag, student_id_no, date, time_in, time_out, status } = req.body;
  
  try {
    // Check if the RFID tag or student ID already exists for today's date
    const existingRecord = await Attendance.findByRfidAndDate(rfid_tag, date);
    
    if (existingRecord) {
      return res.status(400).json({ message: "Duplicate RFID tag or student ID for the given date." });
    }

    // Proceed to create a new record if no existing record is found
    await Attendance.create(rfid_tag, student_id_no, date, time_in, time_out, status);
    res.status(201).json({ message: "Attendance record added successfully!" });
  } catch (error) {
    console.error("Error creating attendance record:", error);
    res.status(500).json({ error: "Unable to create attendance record." });
  }
};
