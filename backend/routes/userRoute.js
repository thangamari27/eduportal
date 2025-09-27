const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authenticateAdmin } = require('../middleware/auth');

// Public routes
router.post('/register', async (req, res) => {
  try {
    const { email, phone_no, password, name } = req.body;

    // Basic validation
    if (!email || !phone_no || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email, phone number, and password are required'
      });
    }

    // Call controller
    await userController.registerUser(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
});

// Student Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    await userController.loginUser(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

// Admin Login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    await userController.loginAdmin(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Admin login failed'
    });
  }
});

// Get User Profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    await userController.getUserProfile(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get profile'
    });
  }

});

// Protected user routes
router.put('/profile', authenticateToken, userController.updateUserProfile);
router.put('/change-password', authenticateToken, userController.changePassword);

// Admin only routes
router.get('/admin/users', authenticateAdmin, userController.getAllUsers);

module.exports = router;