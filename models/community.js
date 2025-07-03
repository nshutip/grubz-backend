'use strict';

module.exports = (sequelize, DataTypes) => {
  const Community = sequelize.define('Community', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    logo_url: {
      type: DataTypes.STRING,
      allowNull: true
    }
  });

  Community.associate = (models) => {
    Community.hasMany(models.User, { foreignKey: 'communityId' });
    Community.hasMany(models.Vendor, { foreignKey: 'communityId' });
  };

  return Community;
};
