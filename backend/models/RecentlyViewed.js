const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RecentlyViewed = sequelize.define('RecentlyViewed', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  visitorId: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Products', key: 'id' },
  },
  viewedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: false,
  indexes: [
    { fields: ['visitorId', 'viewedAt'] },
  ],
});

module.exports = RecentlyViewed;
