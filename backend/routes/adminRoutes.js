const express = require('express');
const router = express.Router();
const MainController = require('../controllers/MainController');

router.post('/register', MainController.registerAdmin);
router.post('/login', MainController.loginAdmin);
router.get('/dashboard', MainController.dashboard);
router.get('/verify-email', MainController.verifyEmail);


module.exports = router;
