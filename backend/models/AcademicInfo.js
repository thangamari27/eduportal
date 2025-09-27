module.exports = (sequelize, DataTypes) => {
  const AcademicInfo = sequelize.define('AcademicInfo', {
    academic_id: {
      type: DataTypes.STRING(40),
      primaryKey: true
    },
    student_id: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    school_name: DataTypes.STRING(255),
    exam_register_number: DataTypes.STRING(100),
    emis_no: DataTypes.STRING(100),
    subjects: DataTypes.JSON,
    total_marks: DataTypes.INTEGER,
    mark_percentage: DataTypes.DECIMAL(5, 2),
    cutoff_marks: DataTypes.DECIMAL(5, 2),
    month_year_passing: DataTypes.STRING(10),
    course_type: DataTypes.STRING(50),
    course_name: DataTypes.STRING(100),
    course_mode: DataTypes.STRING(50),
    passport_photo: DataTypes.BLOB('long'),
    aadhaar_card: DataTypes.BLOB('long'),
    transfer_certificate: DataTypes.BLOB('long')
  }, {
    tableName: 'academic_info',
    timestamps: false
  });
  
  return AcademicInfo;
};