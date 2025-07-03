'use strict';

module.exports = (sequelize, DataTypes) => {
  const Vendor = sequelize.define('Vendor', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    logo_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    is_approved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    communityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Communities',
        key: 'id'
      }
    }
  });

  Vendor.associate = (models) => {
    Vendor.belongsTo(models.User, { foreignKey: 'userId' });
    Vendor.belongsTo(models.Community, { foreignKey: 'communityId' });

    Vendor.hasMany(models.MenuItem, { foreignKey: 'vendorId' });
    Vendor.hasMany(models.Order, { foreignKey: 'vendorId' });
  };

  return Vendor;
};
