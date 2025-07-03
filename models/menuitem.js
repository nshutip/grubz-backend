'use strict';

module.exports = (sequelize, DataTypes) => {
  const MenuItem = sequelize.define('MenuItem', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    is_available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    vendorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Vendors',
        key: 'id'
      }
    }
  });

  MenuItem.associate = (models) => {
    MenuItem.belongsTo(models.Vendor, { foreignKey: 'vendorId' });
    MenuItem.hasMany(models.OrderItem, { foreignKey: 'menuItemId' });
  };

  return MenuItem;
};
