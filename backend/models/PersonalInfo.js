module.exports = (sequelize, DataTypes) => {
  const PersonalInfo = sequelize.define('PersonalInfo', {
    student_id: {
      type: DataTypes.STRING(20),
      primaryKey: true
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
     
    },
    phone_number: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    aadhaar_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
 
    },
    blood_group: DataTypes.STRING(5),
    date_of_birth: DataTypes.DATE,
    gender: DataTypes.STRING(20),
    address: DataTypes.TEXT,
    father_name: DataTypes.STRING(100),
    father_occupation: DataTypes.STRING(100),
    mother_name: DataTypes.STRING(100),
    mother_occupation: DataTypes.STRING(100),
    annual_income: DataTypes.DECIMAL(15, 2),
    community: DataTypes.STRING(50),
    caste: DataTypes.STRING(50),
    religion: DataTypes.STRING(50),
    nationality: DataTypes.STRING(50)
  }, {
    tableName: 'personal_info',
    timestamps: false
  });
  
  return PersonalInfo;
};