'use strict';

module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    vendorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Vendors',
        key: 'id'
      }
    },
    total_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM(
        'pending',
        'accepted',
        'preparing',
        'ready',
        'rejected',
        'completed'
      ),
      defaultValue: 'pending'
    },
    payment_status: {
      type: DataTypes.ENUM('pending', 'paid', 'failed'),
      defaultValue: 'pending'
    }
  });

  Order.associate = (models) => {
    Order.belongsTo(models.User, { foreignKey: 'customerId', as: 'customer' });
    Order.belongsTo(models.Vendor, { foreignKey: 'vendorId' });

    Order.hasMany(models.OrderItem, { foreignKey: 'orderId' });
    Order.hasOne(models.Payment, { foreignKey: 'orderId' });
  };

  return Order;
};
