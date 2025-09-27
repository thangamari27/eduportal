const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authenticateToken, authenticateAdmin } = require('../middleware/auth');

// Public routes (optional - if you want some courses to be publicly accessible)
// router.get('/public', courseController.getAllCourses);

// User routes (require authentication)
router.get('/', authenticateToken, courseController.getAllCourses);
router.get('/:id', authenticateToken, courseController.getCourseById);

// Admin routes (require admin authentication)
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