const { Sequelize } = require('sequelize');
require('dotenv').config();

// 创建 Sequelize 实例
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: console.log, // 开发环境下记录 SQL 语句
  }
);

// 测试数据库连接
sequelize.authenticate()
  .then(() => {
    console.log('✓ 数据库连接成功');
  })
  .catch(err => {
    console.error('✗ 数据库连接失败:', err);
  });

module.exports = sequelize;
