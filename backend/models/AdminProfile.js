// models/AdminProfile.js
module.exports = (sequelize, DataTypes) => {
  const AdminProfile = sequelize.define('AdminProfile', {
    admin_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      references: { model: 'admin_users', key: 'id' }
    },
    first_name: { type: DataTypes.STRING(100), allowNull: false },
    last_name: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(255), allowNull: false },
    phone_number: { type: DataTypes.STRING(20), allowNull: false },
    date_of_birth: DataTypes.DATEONLY,
    gender: { type: DataTypes.STRING(20) },
    address: DataTypes.TEXT
  }, {
    tableName: 'admin_profile',
    underscored: true,
    timestamps: false,
  });

  AdminProfile.associate = models => {
    AdminProfile.belongsTo(models.AdminUser, {
      foreignKey: 'admin_id',
      as: 'admin'
    });
  };

  return AdminProfile;
};
