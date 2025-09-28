const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const admissionController = require('../controllers/admissionController');
const { authenticateToken, authenticateAdmin } = require('../middleware/auth');

// User routes (require authentication)
router.use(authenticateToken);

// Complete application flow
router.post('/submit', admissionController.submitApplication);
router.get('/application', admissionController.getCompleteApplication);

// Individual component routes
router.get('/personal-info', admissionController.getPersonalInfo);
router.put('/personal-info', admissionController.updatePersonalInfo);
router.get('/academic-info', admissionController.getAcademicInfo);
router.put('/academic-info', admissionController.updateAcademicInfo);
router.get('/extra-info', admissionController.getExtraInfo);
router.put('/extra-info', admissionController.updateExtraInfo);
router.get('/admission-record', admissionController.getAdmissionRecord);

// Dashboard statistics route
router.get('/admin-dashboard/statistics', authenticateToken, admissionController.getAdmissionStatistics);
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

