const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING(550),
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  image: {
    type: DataTypes.STRING(1000),
    allowNull: true,
  },
  brand: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  model: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  specifications: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'Categories', key: 'id' },
  },
  popularity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  lowestPrice: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
  },
  highestPrice: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  timestamps: true,
  indexes: [
    { fields: ['name'] },
    { fields: ['brand'] },
    { fields: ['categoryId'] },
    { fields: ['popularity'] },
  ],
});

module.exports = Product;
