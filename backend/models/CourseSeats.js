module.exports = (sequelize, DataTypes) => {
  
const CourseSeat = sequelize.define('CourseSeat', {
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
  seats: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0
    }
  }
}, {
  tableName: 'course_seats',
  timestamps: false
});
  
  return CourseSeat;
};