const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Store = sequelize.define('Store', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  slug: {
    type: DataTypes.STRING(120),
    allowNull: false,
    unique: true,
  },
  url: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  logo: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  color: {
    type: DataTypes.STRING(7),
    defaultValue: '#6366f1',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  timestamps: true,
});

module.exports = Store;
