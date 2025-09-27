const { PersonalInfo, AcademicInfo } = require('../models');

const generateStudentId = async () => {
  const latestStudent = await PersonalInfo.findOne({
    order: [['student_id', 'DESC']]
  });

  let nextNumber = 1;
  if (latestStudent && latestStudent.student_id) {
    const lastNumber = parseInt(latestStudent.student_id.split('-')[1]);
    nextNumber = lastNumber + 1;
  }

  return `STU-${nextNumber.toString().padStart(6, '0')}`;
};

const generateAcademicId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ACAD-${timestamp}-${random}`;
};

const generateAdmissionId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ADM-${timestamp}-${random}`;
};

module.exports = {
  generateStudentId,
  generateAcademicId,
  generateAdmissionId
};