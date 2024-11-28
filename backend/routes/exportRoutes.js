const express = require('express');
const router = express.Router();
const { exportCSV, exportPDF } = require('../controllers/exportController');  // Import controller functions

// Define routes for CSV and PDF exports
router.get('/export/csv', exportCSV);   // Route for exporting CSV
router.get('/export/pdf', exportPDF);   // Route for exporting PDF

module.exports = router;  // Export the router to be used in app.js
