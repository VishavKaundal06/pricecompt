const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Coupon = sequelize.define('Coupon', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  code: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  discountType: {
    type: DataTypes.ENUM('percentage', 'flat'),
    defaultValue: 'percentage',
  },
  discountValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  minOrder: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
  },
  maxDiscount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
  },
  storeId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'Stores', key: 'id' },
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'Categories', key: 'id' },
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  sourceUrl: {
    type: DataTypes.STRING(2000),
    allowNull: true,
  },
  usageCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  timestamps: true,
});

module.exports = Coupon;
