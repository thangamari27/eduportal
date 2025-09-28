const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, AdminUser, PersonalInfo, AdminProfile } = require('../models');
const { generateStudentId } = require('../utils/idGenerator');

// User Registration
const registerUser = async (req, res) => {
  try {
    const { email, phone_no, password } = req.body;

    // Validate required fields
    if (!email || !phone_no || !password) {
      return res.status(400).json({ error: 'Email, phone number, and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await User.create({
      email,
      phone_no,
      password_hash
    });

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        phone_no: user.phone_no
      },
      token
    });

  } catch (error) {
    console.error('User registration error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    
    res.status(500).json({ error: 'Failed to register user' });
  }
};

// User Login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        phone_no: user.phone_no,
        student_id: user.student_id
      },
      token
    });

  } catch (error) {
    console.error('User login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
};


// Admin Login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find admin
    const admin = await AdminUser.findOne({ where: { email } });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    // For the sample admin, we'll use simple comparison
    // In production, you should hash admin passwords too
    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      // Fallback for the sample admin (plain text)
      if (password !== admin.password) {
        return res.status(401).json({ error: 'Invalid admin credentials' });
      }
    }

    // Generate token
    const token = jwt.sign(
      { adminId: admin.id, email: admin.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Admin login successful',
      admin: {
        id: admin.id,
        email: admin.email
      },
      token
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Failed to login as admin' });
  }
};

// Get All Users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password_hash'] },
      include: [{
        association: 'personalInfo',
        attributes: ['student_id', 'first_name', 'last_name', 'email']
      }]
    });

    res.json({ 
      message: 'Users retrieved successfully',
      count: users.length,
      users 
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
};

// Change User Password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    // Get user with password hash
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const validCurrentPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!validCurrentPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await User.update(
      { password_hash: newPasswordHash },
      { where: { id: userId } }
    );

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};

// ---------------------
// GET User Profile
// ---------------------
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] },
      include: [{
        model: PersonalInfo,
        as: 'personalInfo',
        required: false
      }]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const profileData = user.personalInfo ? {
      first_name: user.personalInfo.first_name,
      last_name: user.personalInfo.last_name,
      email: user.personalInfo.email,
      phone_number: user.personalInfo.phone_number,
      date_of_birth: user.personalInfo.date_of_birth,
      gender: user.personalInfo.gender,
      address: user.personalInfo.address
    } : {
      first_name: '',
      last_name: '',
      email: user.email,
      phone_number: user.phone_no,
      date_of_birth: null,
      gender: '',
      address: ''
    };

    res.json({ success: true, user: { ...user.toJSON(), profileData } });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
};

// ---------------------
// PUT / UPDATE User Profile
// ---------------------
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { profileData } = req.body;

    if (!profileData) {
      return res.status(400).json({ error: 'Profile data is required' });
    }

    const currentUser = await User.findByPk(userId);
    if (!currentUser) return res.status(404).json({ error: 'User not found' });

    // Allowed fields for user
    const allowedFields = ['first_name', 'last_name', 'date_of_birth', 'gender', 'address'];
    const updates = {};
    allowedFields.forEach(f => {
      if (profileData[f] !== undefined) updates[f] = profileData[f];
    });

    if (!currentUser.student_id) {
      const student_id = generateStudentId ? generateStudentId(currentUser.id) : `STU-${Date.now()}`;
      await User.update({ student_id }, { where: { id: userId } });
      currentUser.student_id = student_id;
    }

    // Upsert personal info
    const [personalInfo, created] = await PersonalInfo.findOrCreate({
      where: { student_id: currentUser.student_id },
      defaults: {
        student_id: currentUser.student_id,
        email: currentUser.email,
        phone_number: currentUser.phone_no,
        ...updates
      }
    });

    if (!created) {
      await PersonalInfo.update(updates, { where: { student_id: currentUser.student_id } });
    }

    const updatedInfo = await PersonalInfo.findOne({ where: { student_id: currentUser.student_id } });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      personalInfo: updatedInfo
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// ---------------------
// GET Admin Profile
// ---------------------
const getAdminProfile = async (req, res) => {
  try {
    const admin = await AdminUser.findByPk(req.admin.id, {
      attributes: { exclude: ['password'] },
      include: [{
        model: AdminProfile,
        as: 'adminProfile',
        required: false
      }]
    });

    if (!admin) return res.status(404).json({ error: 'Admin not found' });

    const profileData = admin.adminProfile ? {
      first_name: admin.adminProfile.first_name,
      last_name: admin.adminProfile.last_name,
      email: admin.adminProfile.email,
      phone_number: admin.adminProfile.phone_number,
      date_of_birth: admin.adminProfile.date_of_birth,
      gender: admin.adminProfile.gender,
      address: admin.adminProfile.address
    } : {
      first_name: '',
      last_name: '',
      email: admin.email,
      phone_number: '',
      date_of_birth: null,
      gender: '',
      address: ''
    };

    res.json({ success: true, admin: { ...admin.toJSON(), profileData } });
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({ error: 'Failed to get admin profile' });
  }
};

// ---------------------
// PUT / UPDATE Admin Profile
// ---------------------
const updateAdminProfile = async (req, res) => {
  try {
    const adminId = req.admin.id;
    const { profileData } = req.body;

    if (!profileData) return res.status(400).json({ error: 'Profile data is required' });

    const currentAdmin = await AdminUser.findByPk(adminId);
    if (!currentAdmin) return res.status(404).json({ error: 'Admin not found' });

    const allowedFields = ['first_name', 'last_name', 'phone_number', 'date_of_birth', 'gender', 'address'];
    const updates = {};
    allowedFields.forEach(f => {
      if (profileData[f] !== undefined) updates[f] = profileData[f];
    });

    const adminProfileData = { ...updates, email: currentAdmin.email };

    let existingProfile = await AdminProfile.findOne({ where: { admin_id: adminId } });
    if (existingProfile) {
      await AdminProfile.update(adminProfileData, { where: { admin_id: adminId } });
    } else {
      await AdminProfile.create({ admin_id: adminId, ...adminProfileData });
    }

    const updatedAdmin = await AdminUser.findByPk(adminId, {
      attributes: { exclude: ['password'] },
      include: [{ model: AdminProfile, as: 'adminProfile', required: false }]
    });

    res.json({
      success: true,
      message: 'Admin profile updated successfully',
      admin: updatedAdmin
    });
  } catch (error) {
    console.error('Update admin profile error:', error);
    res.status(500).json({ error: 'Failed to update admin profile' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getAdminProfile,
  updateAdminProfile,
  loginAdmin,
  getAllUsers,
  changePassword
};