const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const Address = sequelize.define('Address', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '收货人姓名'
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '收货人手机号'
  },
  province: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '省份'
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '城市'
  },
  district: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '区县'
  },
  detailAddress: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '详细地址'
  },
  postalCode: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '邮政编码'
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否为默认地址'
  }
}, {
  tableName: 'addresses',
  timestamps: true,
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['isDefault']
    }
  ]
});

module.exports = Address;