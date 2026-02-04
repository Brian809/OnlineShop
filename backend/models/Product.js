const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  category: {
    type: DataTypes.STRING
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '商品主图（首图）'
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  picCollection: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '商品详情图集合（JSON 数组格式）'
  },
  detailImages: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '商品详情图数组（JSON 数组格式，用于详情页展示）'
  },
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '乐观锁版本号'
  }
}, {
  tableName: 'products',
  timestamps: true,
  // 启用乐观锁
  version: true
});

module.exports = Product;
