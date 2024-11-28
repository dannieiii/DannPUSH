// app.js

const express = require('express');
const bodyParser = require('body-parser');
const adminRoutes = require('./routes/adminRoutes');
const studentRoutes = require('./routes/studentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();
const cors = require('cors');

app.use(express.json()); // Middleware to parse JSON bodies


// Middleware
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors());

// API Routes
app.use('/api', adminRoutes);


app.use('/api', studentRoutes);

app.use('/api/attendance', attendanceRoutes);
app.use('/api/reports', reportRoutes);


// Serve static files (e.g., registration page)
app.use(express.static('public'));

const port = process.env.PORT || 8081;
app.listen(port, () => console.log(`Server is running on port ${port}`));
