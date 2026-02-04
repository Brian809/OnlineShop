var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport');
var session = require('express-session');
var cors = require('cors');
require('dotenv').config();

// 配置
require('./config/passport');
const sequelize = require('./config/database');
require('./models'); // 初始化模型关联

var app = express();

// CORS 配置
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// 中间件
app.use(logger('dev'));
app.use(express.json({ limit: '10mb' })); // 增加 JSON 请求体大小限制
app.use(express.urlencoded({ extended: false, limit: '10mb' })); // 增加 URL 编码请求体大小限制
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Session 配置
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' } // 开发环境设为 false，生产环境设为 true
}));

// Passport 初始化
app.use(passport.initialize());
app.use(passport.session());

// 数据库同步（仅开发环境）
// 注意：生产环境完全跳过 sync，避免自动修改数据库结构
// 如果需要修改表结构，请手动执行 SQL 迁移脚本
if (process.env.NODE_ENV !== 'production') {
  sequelize.sync({ alter: process.env.SYNC_ALTER === 'true' })
    .then(() => console.log('✓ 数据库同步成功'))
    .catch(err => console.error('✗ 数据库同步失败:', err));
} else {
  console.log('✓ 生产环境 - 跳过数据库同步');
}

// 路由
const authRouter = require('./routes/auth');
const productsRouter = require('./routes/products');
const usersRouter = require('./routes/users');
const adminRouter = require('./routes/admin');
const normalFunctionsRouter = require('./routes/normalFunctions');
const cartRouter = require('./routes/cart');
const ordersRouter = require('./routes/orders');
const paymentRouter = require('./routes/payment');

app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/users', usersRouter);
app.use('/api/admin', adminRouter);
app.use('/api/normal', normalFunctionsRouter);
app.use('/api/cart',cartRouter );
app.use('/api/orders', ordersRouter);
app.use('/api/payment', paymentRouter);

// 启动定时任务（自动取消超时订单）
if (process.env.NODE_ENV !== 'test') {
  const cancelExpiredOrders = require('./useful_scripts/cancelExpiredOrders');

  // 每5分钟执行一次
  setInterval(() => {
    console.log('执行定时任务：检查超时订单');
    cancelExpiredOrders();
  }, 5 * 60 * 1000);

  console.log('✓ 定时任务已启动（每5分钟检查一次超时订单）');
}

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  const message = err.message;
  const error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500).json({
    message: message,
    error: error
  });
});

module.exports = app;
