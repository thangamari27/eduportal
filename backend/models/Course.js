module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define('Course', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    fees: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    duration: DataTypes.STRING(100),
    eligibility: DataTypes.TEXT,
    fees_link: DataTypes.TEXT,
    brochure_link: DataTypes.TEXT,
    brochure_name: DataTypes.TEXT,
    apply_link: DataTypes.TEXT,
    apply_name: DataTypes.TEXT
  }, {
    tableName: 'courses',
    timestamps: false
  });
  
  return Course;
};