'use strict';

module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Orders',
        key: 'id'
      }
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    method: {
      type: DataTypes.ENUM('momo', 'card', 'wallet'),
      allowNull: false
    },
    transaction_id: {
      type: DataTypes.STRING,
      allowNull: true // Can be null before confirmation from gateway
    },
    status: {
      type: DataTypes.ENUM('success', 'failed', 'pending'),
      defaultValue: 'pending'
    },
    paid_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  });

  Payment.associate = (models) => {
    Payment.belongsTo(models.Order, { foreignKey: 'orderId' });
  };

  return Payment;
};
