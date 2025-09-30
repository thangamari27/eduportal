const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const admissionController = require('../controllers/admissionController');
const { authenticateToken, authenticateAdmin } = require('../middleware/auth');


// ✅ User routes (require user authentication)
router.post('/submit', authenticateToken, admissionController.submitApplication);
router.get('/application', authenticateToken, admissionController.getCompleteApplication);

// Individual component routes (user auth)
router.get('/personal-info', authenticateToken, admissionController.getPersonalInfo);
router.put('/personal-info', authenticateToken, admissionController.updatePersonalInfo);
router.get('/academic-info', authenticateToken, admissionController.getAcademicInfo);
router.put('/academic-info', authenticateToken, admissionController.updateAcademicInfo);
router.get('/extra-info', authenticateToken, admissionController.getExtraInfo);
router.put('/extra-info', authenticateToken, admissionController.updateExtraInfo);
router.get('/admission-record', authenticateToken, admissionController.getAdmissionRecord);

// Dashboard statistics routes
router.get('/admin-dashboard/statistics', authenticateAdmin, admissionController.getAdmissionStatistics);
router.get('/student-dashboard/statistics', authenticateToken, admissionController.getUserAdmissionStatistics);

// User application status route
router.get('/application/status', authenticateToken, admissionController.getUserApplicationStatus);

// Admin routes
router.get('/admin/applications', authenticateAdmin, admissionController.getAllApplications);
router.put('/admin/application/:admissionId/status', authenticateAdmin, admissionController.updateApplicationStatus);
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Handle file storage logic here
    res.json({ 
      message: 'File uploaded successfully', 
      filename: req.file.filename,
      originalname: req.file.originalname 
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

module.exports = router;