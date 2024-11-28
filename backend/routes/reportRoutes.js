const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/reportController');

// Route to fetch student reports
router.get('/studentreports', ReportController.getReports);

module.exports = router;
