const express = require('express');
const router = express.Router();
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

// Admin routes
router.get('/admin/applications', authenticateAdmin, admissionController.getAllApplications);
router.put('/admin/application/:admissionId/status', authenticateAdmin, admissionController.updateApplicationStatus);

module.exports = router;