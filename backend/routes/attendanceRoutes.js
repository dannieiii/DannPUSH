const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");

// Get all attendance records
router.get("/attendancerecord", attendanceController.getAllRecords);
// Add a new attendance record
router.post("/", attendanceController.createAttendanceRecord);

module.exports = router;
