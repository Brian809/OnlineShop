const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/User'); // 假设有一个用户模型用于数据库操作
require('dotenv').config();


// Local Strategy: 用于登录
passport.use(new LocalStrategy(
  {
    usernameField: 'email', // 使用 email 作为主字段名
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      // 判断输入的是 email 还是 username
      const isEmail = email.includes('@');

      let user;

      if (isEmail) {
        // 如果包含 @，优先按 email 查找
        user = await User.findOne({ where: { email } });
        if (!user) {
          return done(null, false, { message: '邮箱或用户名不存在' });
        }
      } else {
        // 如果不包含 @，按 username 查找
        user = await User.findOne({ where: { username: email } });
        if (!user) {
          return done(null, false, { message: '邮箱或用户名不存在' });
        }
      }

      // 检查用户是否被禁用
      if (user.isdisabled) {
        return done(null, false, { message: '账户已被禁用，请联系管理员' });
      }

      // 验证密码
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return done(null, false, { message: '密码错误' });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

// JWT Strategy: 用于受保护的路由
passport.use(new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
  },
  async (jwtPayload, done) => {
    try {
      // 从数据库查询用户
      const user = await User.findOne({ where: { id: jwtPayload.id } });

      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (err) {
      return done(err);
    }
  }
));

// 序列化用户
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// 反序列化用户
passport.deserializeUser(async (id, done) => {
  const user = await User.findOne({ id });
  done(null, user);
});

module.exports = passport;
