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

// 路由
const authRouter = require('./routes/auth');
const productsRouter = require('./routes/products');
const usersRouter = require('./routes/users');
const adminRouter = require('./routes/admin');
const normalFunctionsRouter = require('./routes/normalFunctions');


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
  cookie: { secure: false } // 开发环境设为 false，生产环境设为 true
}));

// Passport 初始化
app.use(passport.initialize());
app.use(passport.session());

// 数据库同步（开发环境）
sequelize.sync({ alter: process.env.NODE_ENV === 'development' })
  .then(() => console.log('✓ 数据库同步成功'))
  .catch(err => console.error('✗ 数据库同步失败:', err));

// 路由
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/users', usersRouter);
app.use('/api/admin', adminRouter);
app.use('/api/normal', normalFunctionsRouter);


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
