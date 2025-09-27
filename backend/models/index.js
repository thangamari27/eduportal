const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Import model functions
const UserModel = require('./user');
const AdminUserModel = require('./AdminUser');
const CourseModel = require('./Course');
const CourseDetailModel = require('./CourseDetail');
const CourseSeatModel = require('./CourseSeats');
const PersonalInfoModel = require('./personalInfo');
const AcademicInfoModel = require('./academicInfo');
const ExtraInfoModel = require('./extraInfo');
const AdmissionRecordModel = require('./admissionRecord');

// Initialize models
const User = UserModel(sequelize, DataTypes);
const AdminUser = AdminUserModel(sequelize, DataTypes);
const Course = CourseModel(sequelize, DataTypes);
const CourseDetail = CourseDetailModel(sequelize, DataTypes);
const CourseSeat = CourseSeatModel(sequelize, DataTypes);
const PersonalInfo = PersonalInfoModel(sequelize, DataTypes);
const AcademicInfo = AcademicInfoModel(sequelize, DataTypes);
const ExtraInfo = ExtraInfoModel(sequelize, DataTypes);
const AdmissionRecord = AdmissionRecordModel(sequelize, DataTypes);

// Define Associations

// User ↔ PersonalInfo (One-to-One via student_id)
User.hasOne(PersonalInfo, {
  foreignKey: 'student_id',
  sourceKey: 'student_id',
  as: 'personalInfo'
});

PersonalInfo.belongsTo(User, {
  foreignKey: 'student_id',
  targetKey: 'student_id',
  as: 'user'
});

// PersonalInfo ↔ AcademicInfo (One-to-One)
PersonalInfo.hasOne(AcademicInfo, {
  foreignKey: 'student_id',
  as: 'academicInfo'
});

AcademicInfo.belongsTo(PersonalInfo, {
  foreignKey: 'student_id',
  as: 'personalInfo'
});

// PersonalInfo ↔ ExtraInfo (One-to-One)
PersonalInfo.hasOne(ExtraInfo, {
  foreignKey: 'student_id',
  as: 'extraInfo'
});

ExtraInfo.belongsTo(PersonalInfo, {
  foreignKey: 'student_id',
  as: 'personalInfo'
});

// PersonalInfo ↔ AdmissionRecord (One-to-One)
PersonalInfo.hasOne(AdmissionRecord, {
  foreignKey: 'student_id',
  as: 'admissionRecord'
});

AdmissionRecord.belongsTo(PersonalInfo, {
  foreignKey: 'student_id',
  as: 'personalInfo'
});

// Course ↔ CourseDetail (One-to-Many)
Course.hasMany(CourseDetail, {
  foreignKey: 'course_id',
  as: 'courseDetails'
});

CourseDetail.belongsTo(Course, {
  foreignKey: 'course_id',
  as: 'course'
});

// Course ↔ CourseSeat (One-to-Many)
Course.hasMany(CourseSeat, {
  foreignKey: 'course_id',
  as: 'courseSeats'
});

CourseSeat.belongsTo(Course, {
  foreignKey: 'course_id',
  as: 'course'
});

module.exports = {
  sequelize,
  User,
  AdminUser,
  Course,
  CourseDetail,
  CourseSeat,
  PersonalInfo,
  AcademicInfo,
  ExtraInfo,
  AdmissionRecord
};