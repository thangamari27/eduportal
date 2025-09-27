module.exports = (sequelize, DataTypes) => {
  const ExtraInfo = sequelize.define('ExtraInfo', {
    student_id: {
      type: DataTypes.STRING(20),
      primaryKey: true
    },
    physically_challenged: DataTypes.STRING(50),
    ex_serviceman: DataTypes.STRING(50),
    activities: DataTypes.TEXT
  }, {
    tableName: 'extra_info',
    timestamps: false
  });
  
  return ExtraInfo;
};