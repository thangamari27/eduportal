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

// Get Admission Record
const getAdmissionRecord = async (req, res) => {
  try {
    const admissionRecord = await AdmissionRecord.findOne({
      where: { student_id: req.user.student_id },
      include: ['personalInfo']
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

// Get Complete Application (All data)
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
          association: 'admissionRecord'
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

// Admin: Get All Applications
const getAllApplications = async (req, res) => {
  try {
    const applications = await AdmissionRecord.findAll({
      include: [{
        association: 'personalInfo',
        include: ['academicInfo', 'extraInfo']
      }]
    });

    res.json({ applications });
  } catch (error) {
    console.error('Get all applications error:', error);
    res.status(500).json({ error: 'Failed to get applications' });
  }
};

// Admin: Update Application Status
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
      include: ['personalInfo']
    });

    res.json({ message: 'Application status updated', admissionRecord });
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
  getAdmissionRecord,
  getCompleteApplication,
  getAllApplications,
  updateApplicationStatus
};