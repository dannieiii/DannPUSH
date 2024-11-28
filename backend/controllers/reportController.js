const ReportModel = require('../models/reportModel');

const ReportController = {
  getReports: async (req, res) => {
    try {
      const [rows] = await ReportModel.getAllReports();
      console.log(rows);  // Log the result to check the data
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = ReportController;
