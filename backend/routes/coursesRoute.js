const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authenticateToken, authenticateAdmin } = require('../middleware/auth');

// Public routes (no authentication required)
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);
router.get('/course-details', courseController.getAllCourseDetails);
router.get('/course-seats', courseController.getAllCourseSeats);
router.get('/course-details-seats/:courseId', courseController.getCourseDetailsAndSeats);

// Admin routes (require admin authentication) - FIXED: All use authenticateAdmin
router.post('/admin/course', authenticateAdmin, courseController.createCourse);
router.get('/admin/all', authenticateAdmin, courseController.adminGetAllCourses);
router.put('/admin/:id', authenticateAdmin, courseController.updateCourse);
router.delete('/admin/:id', authenticateAdmin, courseController.deleteCourse);

// Admin course details routes
router.post('/admin/details', authenticateAdmin, courseController.addCourseDetail);
router.put('/admin/details/:id', authenticateAdmin, courseController.updateCourseDetail);
router.delete('/admin/details/:id', authenticateAdmin, courseController.deleteCourseDetail);

// Admin course seats routes
router.post('/admin/seats', authenticateAdmin, courseController.addCourseSeat);
router.put('/admin/seats/:id', authenticateAdmin, courseController.updateCourseSeat);
router.delete('/admin/seats/:id', authenticateAdmin, courseController.deleteCourseSeat);

module.exports = router;