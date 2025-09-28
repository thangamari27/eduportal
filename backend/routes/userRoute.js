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
    console.error('Get profile route error:', error);
    res.status(500).json({ success: false, error: 'Failed to get profile' });
  }
});

// Update User Profile (PUT)
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    if (!req.body.profileData) {
      return res.status(400).json({ success: false, error: 'Profile data is required' });
    }

    const { profileData } = req.body;
    const allowedFields = ['first_name', 'last_name', 'date_of_birth', 'gender', 'address'];

    const filteredProfileData = {};
    allowedFields.forEach(field => {
      if (profileData[field] !== undefined) filteredProfileData[field] = profileData[field];
    });

    // Optional: additional fields like aadhaar_number
    if (profileData.aadhaar_number) filteredProfileData.aadhaar_number = profileData.aadhaar_number;

    req.body.profileData = filteredProfileData;
    await userController.updateUserProfile(req, res);
  } catch (error) {
    console.error('Update profile route error:', error);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});

// Helper route: Get user profile data only
router.get('/profile-data', authenticateToken, async (req, res) => {
  try {
    await userController.getUserProfile(req, res); // Returns user + profileData
  } catch (error) {
    console.error('Get profile data error:', error);
    res.status(500).json({ success: false, error: 'Failed to get profile data' });
  }
});

// -----------------
// Admin Profile Routes
// -----------------

// Get Admin Profile
router.get('/admin/profile', authenticateAdmin, async (req, res) => {
  try {
    await userController.getAdminProfile(req, res);
  } catch (error) {
    console.error('Get admin profile route error:', error);
    res.status(500).json({ success: false, error: 'Failed to get admin profile' });
  }
});

// Update Admin Profile
router.put('/admin/profile', authenticateAdmin, async (req, res) => {
  try {
    if (!req.body.profileData) {
      return res.status(400).json({ success: false, error: 'Profile data is required' });
    }

    const { profileData } = req.body;
    const allowedFields = ['first_name', 'last_name', 'phone_number', 'date_of_birth', 'gender', 'address'];

    const filteredProfileData = {};
    allowedFields.forEach(field => {
      if (profileData[field] !== undefined) filteredProfileData[field] = profileData[field];
    });

    req.body.profileData = filteredProfileData;
    await userController.updateAdminProfile(req, res);
  } catch (error) {
    console.error('Update admin profile route error:', error);
    res.status(500).json({ success: false, error: 'Failed to update admin profile' });
  }
});

// Helper route: Get admin profile data only
router.get('/admin/profile-data', authenticateAdmin, async (req, res) => {
  try {
    await userController.getAdminProfile(req, res); // Returns admin + profileData
  } catch (error) {
    console.error('Get admin profile data error:', error);
    res.status(500).json({ success: false, error: 'Failed to get admin profile data' });
  }
});

// -----------------
// Existing Protected Routes
// -----------------
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    await userController.changePassword(req, res);
  } catch (error) {
    console.error('Change password route error:', error);
    res.status(500).json({ success: false, error: 'Failed to change password' });
  }
});

// Admin: Get all users
router.get('/admin/users', authenticateAdmin, async (req, res) => {
  try {
    await userController.getAllUsers(req, res);
  } catch (error) {
    console.error('Get all users route error:', error);
    res.status(500).json({ success: false, error: 'Failed to get users' });
  }
});

module.exports = router;