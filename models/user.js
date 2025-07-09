'use strict';

const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('customer', 'vendor', 'community_admin', 'platform_admin'),
      allowNull: false
    },
    communityId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Communities',
        key: 'id'
      }
    }
  }, {
    defaultScope: {
      attributes: { exclude: ['password_hash'] }
    }
  });

  User.associate = (models) => {
    User.belongsTo(models.Community, { foreignKey: 'communityId' });

    // If user is a vendor, may own a vendor record
    User.hasOne(models.Vendor, { foreignKey: 'userId' });

    // If user is a customer, may have many orders
    User.hasMany(models.Order, { foreignKey: 'customerId' });
  };

  // Instance method to check password
  User.prototype.validPassword = async function (password) {
    return await bcrypt.compare(password, this.password_hash);
  };

  // Hash password before saving
  User.beforeCreate(async (user, options) => {
    if (user.password_hash && !user.password_hash.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(10);
      user.password_hash = await bcrypt.hash(user.password_hash, salt);
    }
  });

  return User;
};
