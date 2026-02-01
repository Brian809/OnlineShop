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
      // 尝试通过 email 查找用户
      let user = await User.findOne({ email });

      // 如果 email 查找不到，尝试通过 username 查找
      if (!user) {
        user = await User.findOne({ username: email });
      }

      if (!user) {
        return done(null, false, { message: '用户不存在' });
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
      const user = await User.findOne({ id: jwtPayload.id });

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
