const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductPrice = sequelize.define('ProductPrice', {
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
  originalPrice: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
  },
  discount: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
  },
  url: {
    type: DataTypes.STRING(2000),
    allowNull: true,
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  lastCheckedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: true,
  indexes: [
    { unique: true, fields: ['productId', 'storeId'] },
    { fields: ['price'] },
  ],
});

module.exports = ProductPrice;
