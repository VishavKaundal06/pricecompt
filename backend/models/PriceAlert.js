const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PriceAlert = sequelize.define('PriceAlert', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'id' },
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Products', key: 'id' },
  },
  targetPrice: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  lastNotifiedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  lastNotifiedPrice: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
  },
}, {
  timestamps: true,
  indexes: [
    { fields: ['userId', 'productId'] },
    { fields: ['isActive'] },
  ],
});

module.exports = PriceAlert;
