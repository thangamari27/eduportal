module.exports = (sequelize, DataTypes) => {
  const AdmissionRecord = sequelize.define('AdmissionRecord', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    admission_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    student_id: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    admission_timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    application_status: {
      type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
      defaultValue: 'Pending'
    }
  }, {
    tableName: 'admission_records',
    timestamps: false
  });
  
  return AdmissionRecord;
};