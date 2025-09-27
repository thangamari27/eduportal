const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authenticateAdmin } = require('../middleware/auth');

// Public routes
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/admin/login', userController.loginAdmin);

// Protected user routes
router.get('/profile', authenticateToken, userController.getUserProfile);
router.put('/profile', authenticateToken, userController.updateUserProfile);
router.put('/change-password', authenticateToken, userController.changePassword);

// Admin only routes
router.get('/admin/users', authenticateAdmin, userController.getAllUsers);

module.exports = router;