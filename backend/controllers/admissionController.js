const { PersonalInfo, AcademicInfo, ExtraInfo, AdmissionRecord, User, sequelize } = require('../models');
const { generateStudentId, generateAdmissionId, generateAcademicId } = require('../utils/idGenerator');

// Submit Complete Application
const submitApplication = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    // Check if user already has an application
    const existingApplication = await AdmissionRecord.findOne({
      include: [{
        association: 'personalInfo',
        where: { student_id: req.user.student_id }
      }]
    }, { transaction });

    if (existingApplication) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Application already submitted' });
    }

    const { personalInfo, academicInfo, extraInfo } = req.body;

    // Validate required fields
    if (!personalInfo || !academicInfo) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Personal info and academic info are required' });
    }

    // Generate IDs
    const studentId = await generateStudentId();
    const academicId = generateAcademicId();
    const admissionId = generateAdmissionId();

    // Create Personal Info
    await PersonalInfo.create({
      student_id: studentId,
      ...personalInfo
    }, { transaction });

    // Create Academic Info
    await AcademicInfo.create({
      academic_id: academicId,
      student_id: studentId,
      ...academicInfo
    }, { transaction });

    // Create Extra Info (if provided)
    if (extraInfo) {
      await ExtraInfo.create({
        student_id: studentId,
        ...extraInfo
      }, { transaction });
    }

    // Create Admission Record
    await AdmissionRecord.create({
      admission_id: admissionId,
      student_id: studentId, 
      email: userEmail,
      application_status: 'Pending'
    }, { transaction });

    // Update user with student_id
    await User.update(
      { student_id: studentId },
      { where: { id: userId }, transaction }
    );

    await transaction.commit();

    res.status(201).json({
      message: 'Application submitted successfully',
      student_id: studentId,
      admission_id: admissionId
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Application submission error:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Duplicate entry found (Aadhaar number or email already exists)' });
    }
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    
    res.status(500).json({ error: 'Failed to submit application' });
  }
};

// Get Personal Info
const getPersonalInfo = async (req, res) => {
  try {
    const personalInfo = await PersonalInfo.findOne({
      where: { student_id: req.user.student_id }
    });

    if (!personalInfo) {
      return res.status(404).json({ error: 'Personal info not found' });
    }

    res.json({ personalInfo });
  } catch (error) {
    console.error('Get personal info error:', error);
    res.status(500).json({ error: 'Failed to get personal info' });
  }
};

// Update Personal Info
const updatePersonalInfo = async (req, res) => {
  try {
    const studentId = req.user.student_id;
    const updatedInfo = await PersonalInfo.update(req.body, {
      where: { student_id: studentId },
      returning: true
    });

    if (updatedInfo[0] === 0) {
      return res.status(404).json({ error: 'Personal info not found' });
    }

    const personalInfo = await PersonalInfo.findOne({ where: { student_id: studentId } });
    res.json({ message: 'Personal info updated', personalInfo });
  } catch (error) {
    console.error('Update personal info error:', error);
    res.status(500).json({ error: 'Failed to update personal info' });
  }
};

// Get Academic Info
const getAcademicInfo = async (req, res) => {
  try {
    const academicInfo = await AcademicInfo.findOne({
      where: { student_id: req.user.student_id }
    });

    if (!academicInfo) {
      return res.status(404).json({ error: 'Academic info not found' });
    }

    res.json({ academicInfo });
  } catch (error) {
    console.error('Get academic info error:', error);
    res.status(500).json({ error: 'Failed to get academic info' });
  }
};

// Update Academic Info
const updateAcademicInfo = async (req, res) => {
  try {
    const studentId = req.user.student_id;
    const updatedInfo = await AcademicInfo.update(req.body, {
      where: { student_id: studentId },
      returning: true
    });

    if (updatedInfo[0] === 0) {
      return res.status(404).json({ error: 'Academic info not found' });
    }

    const academicInfo = await AcademicInfo.findOne({ where: { student_id: studentId } });
    res.json({ message: 'Academic info updated', academicInfo });
  } catch (error) {
    console.error('Update academic info error:', error);
    res.status(500).json({ error: 'Failed to update academic info' });
  }
};

// Get Extra Info
const getExtraInfo = async (req, res) => {
  try {
    const extraInfo = await ExtraInfo.findOne({
      where: { student_id: req.user.student_id }
    });

    if (!extraInfo) {
      return res.status(404).json({ error: 'Extra info not found' });
    }

    res.json({ extraInfo });
  } catch (error) {
    console.error('Get extra info error:', error);
    res.status(500).json({ error: 'Failed to get extra info' });
  }
};

// Update Extra Info
const updateExtraInfo = async (req, res) => {
  try {
    const studentId = req.user.student_id;
    const updatedInfo = await ExtraInfo.update(req.body, {
      where: { student_id: studentId },
      returning: true
    });

    if (updatedInfo[0] === 0) {
      return res.status(404).json({ error: 'Extra info not found' });
    }

    const extraInfo = await ExtraInfo.findOne({ where: { student_id: studentId } });
    res.json({ message: 'Extra info updated', extraInfo });
  } catch (error) {
    console.error('Update extra info error:', error);
    res.status(500).json({ error: 'Failed to update extra info' });
  }
};

// Admin: Get Admission Statistics
const getAdmissionStatistics = async (req, res) => {
  try {
    const totalApplications = await AdmissionRecord.count();
    const approvedApplications = await AdmissionRecord.count({
      where: { application_status: 'Approved' }
    });
    const pendingApplications = await AdmissionRecord.count({
      where: { application_status: 'Pending' }
    });
    const rejectedApplications = await AdmissionRecord.count({
      where: { application_status: 'Rejected' }
    });

    res.json({
      totalApplications,
      approvedApplications,
      pendingApplications,
      rejectedApplications
    });
  } catch (error) {
    console.error('Get admission statistics error:', error);
    res.status(500).json({ error: 'Failed to get admission statistics' });
  }
};

// Student: Get User Admission Statistics
const getUserAdmissionStatistics = async (req, res) => {
  try {
    const studentId = req.user && req.user.student_id;
    if (!studentId) {
      return res.status(400).json({ error: 'Authenticated user missing student_id' });
    }

    const totalApplications = await AdmissionRecord.count({ where: { student_id: studentId } });
    const approvedApplications = await AdmissionRecord.count({
      where: { student_id: studentId, application_status: 'Approved' }
    });
    const pendingApplications = await AdmissionRecord.count({
      where: { student_id: studentId, application_status: 'Pending' }
    });
    const rejectedApplications = await AdmissionRecord.count({
      where: { student_id: studentId, application_status: 'Rejected' }
    });

    res.json({
      student_id: studentId,
      totalApplications,
      approvedApplications,
      pendingApplications,
      rejectedApplications
    });
  } catch (error) {
    console.error('Get user admission statistics error:', error);
    res.status(500).json({ error: 'Failed to get user admission statistics' });
  }
};

// Student: Get User Application Status
const getUserApplicationStatus = async (req, res) => { 
  try {
    const admissionRecord = await AdmissionRecord.findOne({
      where: { student_id: req.user.student_id },
      include: [
        {
          association: 'personalInfo',
          attributes: ['first_name', 'last_name']
        },
        {
          association: 'academicInfo',  // ✅ CORRECTED
          attributes: ['course_name']
        }
      ]
    });

    if (!admissionRecord) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Calculate time since application
    const applicationDate = new Date(admissionRecord.admission_timestamp);
    const currentDate = new Date();
    const timeDiff = currentDate - applicationDate;
    
    const daysAgo = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutesAgo = Math.floor(timeDiff / (1000 * 60));

    let appliedTime;
    if (daysAgo > 0) {
      appliedTime = `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
    } else if (hoursAgo > 0) {
      appliedTime = `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
    } else {
      appliedTime = `${minutesAgo} minute${minutesAgo > 1 ? 's' : ''} ago`;
    }

    res.json({
      admission_id: admissionRecord.admission_id,
      application_status: admissionRecord.application_status,
      admission_timestamp: admissionRecord.admission_timestamp,
      applied_time: appliedTime,
      student_name: admissionRecord.personalInfo ? 
        `${admissionRecord.personalInfo.first_name} ${admissionRecord.personalInfo.last_name}` : 
        'N/A',
      course_name: admissionRecord.academicInfo  // ✅ CORRECTED
        ? admissionRecord.academicInfo.course_name 
        : 'N/A'
    });
  } catch (error) {
    console.error('Get user application status error:', error);
    res.status(500).json({ error: 'Failed to get application status' });
  }
};

// Student: Get Admission Record
const getAdmissionRecord = async (req, res) => {
  try {
    const admissionRecord = await AdmissionRecord.findOne({
      where: { student_id: req.user.student_id },
      include: [
        {
          association: 'personalInfo',
          attributes: ['first_name', 'last_name', 'email', 'phone_number']
        },
        {
          association: 'academicInfo',  // ✅ CORRECTED
          attributes: ['course_name', 'academic_id']
        }
      ]
    });

    if (!admissionRecord) {
      return res.status(404).json({ error: 'Admission record not found' });
    }

    res.json({ admissionRecord });
  } catch (error) {
    console.error('Get admission record error:', error);
    res.status(500).json({ error: 'Failed to get admission record' });
  }
};

// Student: Get Complete Application
const getCompleteApplication = async (req, res) => {
  try {
    const personalInfo = await PersonalInfo.findOne({
      where: { student_id: req.user.student_id },
      include: [
        {
          association: 'academicInfo',
          attributes: { exclude: ['passport_photo', 'aadhaar_card', 'transfer_certificate'] }
        },
        {
          association: 'extraInfo'
        },
        {
          association: 'admissionRecord',
          include: [
            {
              association: 'academicInfo',  // ✅ CORRECTED
              attributes: ['course_name']
            }
          ]
        }
      ]
    });

    if (!personalInfo) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({ application: personalInfo });
  } catch (error) {
    console.error('Get complete application error:', error);
    res.status(500).json({ error: 'Failed to get application' });
  }
};

// Admin: Get All Applications - FIXED
const getAllApplications = async (req, res) => {
  try {
    
    const applications = await AdmissionRecord.findAll({
      include: [
        {
          association: 'personalInfo',
          attributes: ['first_name', 'last_name', 'email', 'phone_number'],
          required: false
        },
        {
          association: 'academicInfo',  // ✅ CORRECTED
          attributes: ['course_name', 'academic_id'],
          required: false
        }
      ],
      order: [['admission_timestamp', 'DESC']]
    });

    res.json({ 
      applications,
      count: applications.length,
      message: `Retrieved ${applications.length} applications successfully`
    });

  } catch (error) {
    console.error('❌ Get all applications error:', error);
    console.error('Error details:', error.message);
    
    res.status(500).json({ 
      error: 'Failed to get applications',
      details: error.message
    });
  }
};

// Admin: Update Application Status - FIXED
const updateApplicationStatus = async (req, res) => {
  try {
    const { admissionId } = req.params;
    const { status } = req.body;

    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updated = await AdmissionRecord.update(
      { application_status: status },
      { where: { admission_id: admissionId } }
    );

    if (updated[0] === 0) {
      return res.status(404).json({ error: 'Admission record not found' });
    }

    const admissionRecord = await AdmissionRecord.findOne({
      where: { admission_id: admissionId },
      include: [
        {
          association: 'personalInfo',
          attributes: ['first_name', 'last_name']
        }
      ]
    });

    res.json({ 
      message: 'Application status updated successfully', 
      admissionRecord 
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ error: 'Failed to update application status' });
  }
};

module.exports = {
  submitApplication,
  getPersonalInfo,
  updatePersonalInfo,
  getAcademicInfo,
  updateAcademicInfo,
  getExtraInfo,
  updateExtraInfo,
  getAdmissionStatistics,
  getUserAdmissionStatistics,
  getUserApplicationStatus,
  getAdmissionRecord,
  getCompleteApplication,
  getAllApplications,
  updateApplicationStatus
};