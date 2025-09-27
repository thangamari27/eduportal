const { Course, CourseDetail, CourseSeat, sequelize } = require('../models');

// Public: Get all courses with details and seats
const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({
      include: [
        {
          model: CourseDetail,
          as: 'courseDetails',
          attributes: ['id', 'program', 'fees', 'eligibility']
        },
        {
          model: CourseSeat,
          as: 'courseSeats',
          attributes: ['id', 'seats']
        }
      ],
      order: [['name', 'ASC']]
    });

    res.json({
      message: 'Courses retrieved successfully',
      count: courses.length,
      courses
    });
  } catch (error) {
    console.error('Get all courses error:', error);
    res.status(500).json({ error: 'Failed to retrieve courses' });
  }
};

// Public: Get single course by ID
const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findByPk(id, {
      include: [
        {
          model: CourseDetail,
          as: 'courseDetails',
          attributes: ['id', 'program', 'fees', 'eligibility']
        },
        {
          model: CourseSeat,
          as: 'courseSeats',
          attributes: ['id', 'seats']
        }
      ]
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({ course });
  } catch (error) {
    console.error('Get course by ID error:', error);
    res.status(500).json({ error: 'Failed to retrieve course' });
  }
};

// Public: Get all course details
const getAllCourseDetails = async (req, res) => {
  try {
    const courseDetails = await CourseDetail.findAll({
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'name', 'duration']
        }
      ],
      order: [['id', 'ASC']]
    });

    res.json({
      message: 'Course details retrieved successfully',
      count: courseDetails.length,
      courseDetails
    });
  } catch (error) {
    console.error('Get all course details error:', error);
    res.status(500).json({ error: 'Failed to retrieve course details' });
  }
};

// Public: Get all course seats
const getAllCourseSeats = async (req, res) => {
  try {
    const courseSeats = await CourseSeat.findAll({
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'name']
        }
      ],
      order: [['id', 'ASC']]
    });

    res.json({
      message: 'Course seats retrieved successfully',
      count: courseSeats.length,
      courseSeats
    });
  } catch (error) {
    console.error('Get all course seats error:', error);
    res.status(500).json({ error: 'Failed to retrieve course seats' });
  }
};

// Public: Get course details and seats by course ID
const getCourseDetailsAndSeats = async (req, res) => {
  try {
    const { courseId } = req.params;

    const courseDetails = await CourseDetail.findAll({
      where: { course_id: courseId },
      order: [['id', 'ASC']]
    });

    const courseSeats = await CourseSeat.findAll({
      where: { course_id: courseId },
      order: [['id', 'ASC']]
    });

    res.json({
      message: 'Course details and seats retrieved successfully',
      courseDetails,
      courseSeats
    });
  } catch (error) {
    console.error('Get course details and seats error:', error);
    res.status(500).json({ error: 'Failed to retrieve course details and seats' });
  }
};

// Admin: Create new course
const createCourse = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { 
      name, 
      fees, 
      duration, 
      eligibility, 
      fees_link, 
      brochure_link, 
      brochure_name, 
      apply_link, 
      apply_name,
      courseDetails,
      courseSeats
    } = req.body;

    // Validate required fields
    if (!name || !fees) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Course name and fees are required' });
    }

    // Create course
    const course = await Course.create({
      name,
      fees,
      duration,
      eligibility,
      fees_link,
      brochure_link,
      brochure_name,
      apply_link,
      apply_name
    }, { transaction });

    // Create course details if provided
    if (courseDetails && Array.isArray(courseDetails)) {
      for (const detail of courseDetails) {
        await CourseDetail.create({
          course_id: course.id,
          program: detail.program,
          fees: detail.fees,
          eligibility: detail.eligibility
        }, { transaction });
      }
    }

    // Create course seats if provided
    if (courseSeats && Array.isArray(courseSeats)) {
      for (const seat of courseSeats) {
        await CourseSeat.create({
          course_id: course.id,
          seats: seat.seats
        }, { transaction });
      }
    }

    await transaction.commit();

    // Fetch the complete course with associations
    const createdCourse = await Course.findByPk(course.id, {
      include: [
        {
          model: CourseDetail,
          as: 'courseDetails',
          attributes: ['id', 'program', 'fees', 'eligibility']
        },
        {
          model: CourseSeat,
          as: 'courseSeats',
          attributes: ['id', 'seats']
        }
      ]
    });

    res.status(201).json({
      message: 'Course created successfully',
      course: createdCourse
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Create course error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    
    res.status(500).json({ error: 'Failed to create course' });
  }
};

// Admin: Update course
const updateCourse = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find course
    const course = await Course.findByPk(id, { transaction });
    if (!course) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Course not found' });
    }

    // Update course
    await course.update(updateData, { transaction });

    await transaction.commit();

    // Fetch updated course with associations
    const updatedCourse = await Course.findByPk(id, {
      include: [
        {
          model: CourseDetail,
          as: 'courseDetails',
          attributes: ['id', 'program', 'fees', 'eligibility']
        },
        {
          model: CourseSeat,
          as: 'courseSeats',
          attributes: ['id', 'seats']
        }
      ]
    });

    res.json({
      message: 'Course updated successfully',
      course: updatedCourse
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Update course error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    
    res.status(500).json({ error: 'Failed to update course' });
  }
};

// Admin: Delete course
const deleteCourse = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;

    // Find course
    const course = await Course.findByPk(id, { transaction });
    if (!course) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Course not found' });
    }

    // Delete course (cascade will delete related details and seats)
    await course.destroy({ transaction });

    await transaction.commit();

    res.json({ message: 'Course deleted successfully' });

  } catch (error) {
    await transaction.rollback();
    console.error('Delete course error:', error);
    res.status(500).json({ error: 'Failed to delete course' });
  }
};

// Admin: Get all courses (with more detailed info)
const adminGetAllCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({
      include: [
        {
          model: CourseDetail,
          as: 'courseDetails'
        },
        {
          model: CourseSeat,
          as: 'courseSeats'
        }
      ],
      order: [['id', 'ASC']]
    });

    res.json({
      message: 'Courses retrieved successfully',
      count: courses.length,
      courses
    });
  } catch (error) {
    console.error('Admin get all courses error:', error);
    res.status(500).json({ error: 'Failed to retrieve courses' });
  }
};

// Course Details CRUD

// Admin: Add course detail
const addCourseDetail = async (req, res) => {
  try {
    const { course_id, program, fees, eligibility } = req.body;

    if (!course_id || !program) {
      return res.status(400).json({ error: 'Course ID and program are required' });
    }

    // Check if course exists
    const course = await Course.findByPk(course_id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const courseDetail = await CourseDetail.create({
      course_id,
      program,
      fees,
      eligibility
    });

    res.status(201).json({
      message: 'Course detail added successfully',
      courseDetail
    });

  } catch (error) {
    console.error('Add course detail error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    
    res.status(500).json({ error: 'Failed to add course detail' });
  }
};

// Admin: Update course detail
const updateCourseDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const courseDetail = await CourseDetail.findByPk(id);
    if (!courseDetail) {
      return res.status(404).json({ error: 'Course detail not found' });
    }

    await courseDetail.update(updateData);

    res.json({
      message: 'Course detail updated successfully',
      courseDetail
    });

  } catch (error) {
    console.error('Update course detail error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    
    res.status(500).json({ error: 'Failed to update course detail' });
  }
};

// Admin: Delete course detail
const deleteCourseDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const courseDetail = await CourseDetail.findByPk(id);
    if (!courseDetail) {
      return res.status(404).json({ error: 'Course detail not found' });
    }

    await courseDetail.destroy();

    res.json({ message: 'Course detail deleted successfully' });

  } catch (error) {
    console.error('Delete course detail error:', error);
    res.status(500).json({ error: 'Failed to delete course detail' });
  }
};

// Course Seats CRUD

// Admin: Add course seat
const addCourseSeat = async (req, res) => {
  try {
    const { course_id, seats } = req.body;

    if (!course_id || seats === undefined) {
      return res.status(400).json({ error: 'Course ID and seats are required' });
    }

    // Check if course exists
    const course = await Course.findByPk(course_id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const courseSeat = await CourseSeat.create({
      course_id,
      seats
    });

    res.status(201).json({
      message: 'Course seat added successfully',
      courseSeat
    });

  } catch (error) {
    console.error('Add course seat error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    
    res.status(500).json({ error: 'Failed to add course seat' });
  }
};

// Admin: Update course seat
const updateCourseSeat = async (req, res) => {
  try {
    const { id } = req.params;
    const { seats } = req.body;

    if (seats === undefined) {
      return res.status(400).json({ error: 'Seats are required' });
    }

    const courseSeat = await CourseSeat.findByPk(id);
    if (!courseSeat) {
      return res.status(404).json({ error: 'Course seat not found' });
    }

    await courseSeat.update({ seats });

    res.json({
      message: 'Course seat updated successfully',
      courseSeat
    });

  } catch (error) {
    console.error('Update course seat error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    
    res.status(500).json({ error: 'Failed to update course seat' });
  }
};

// Admin: Delete course seat
const deleteCourseSeat = async (req, res) => {
  try {
    const { id } = req.params;

    const courseSeat = await CourseSeat.findByPk(id);
    if (!courseSeat) {
      return res.status(404).json({ error: 'Course seat not found' });
    }

    await courseSeat.destroy();

    res.json({ message: 'Course seat deleted successfully' });

  } catch (error) {
    console.error('Delete course seat error:', error);
    res.status(500).json({ error: 'Failed to delete course seat' });
  }
};

module.exports = {
  // Public routes
  getAllCourses,
  getCourseById,
  getAllCourseDetails,
  getAllCourseSeats,
  getCourseDetailsAndSeats,
  
  // Admin course routes
  createCourse,
  updateCourse,
  deleteCourse,
  adminGetAllCourses,
  
  // Admin course detail routes
  addCourseDetail,
  updateCourseDetail,
  deleteCourseDetail,
  
  // Admin course seat routes
  addCourseSeat,
  updateCourseSeat,
  deleteCourseSeat
};