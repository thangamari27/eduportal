module.exports = (sequelize, DataTypes) => {
  const CourseDetail = sequelize.define('CourseDetail', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  course_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'courses',
      key: 'id'
    }
  },
  program: {
    type: DataTypes.TEXT,
    validate: {
      notEmpty: true
    }
  },
  fees: {
    type: DataTypes.DECIMAL(10, 2),
    validate: {
      min: 0
    }
  },
  eligibility: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'course_details',
  timestamps: false
});

return CourseDetail
};