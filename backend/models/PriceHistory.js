const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PriceHistory = sequelize.define('PriceHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Products', key: 'id' },
  },
  storeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Stores', key: 'id' },
  },
  price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  recordedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: false,
  indexes: [
    { fields: ['productId', 'storeId', 'recordedAt'] },
    { fields: ['recordedAt'] },
  ],
});

module.exports = PriceHistory;
