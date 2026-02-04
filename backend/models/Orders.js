const {DataTypes} = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending'
  },
  addressId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '收货地址ID'
  },
  receiverName: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '收货人姓名'
  },
  receiverPhone: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '收货人电话'
  },
  fullAddress: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '完整收货地址'
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '订单过期时间（超过此时间自动取消）'
  },
  address:{
    type: DataTypes.STRING,
    defaultValue: null,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'orders',
  timestamps: true,
  indexes: [
    {
      fields: ['status']
    },
    {
      fields: ['expiresAt']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['addressId']
    }
  ]
});

module.exports = Order;
