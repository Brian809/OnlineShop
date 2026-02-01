const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
require('dotenv').config();

// 注册
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // 基本验证
    if (!username || !email || !password) {
      return res.status(400).json({ message: '缺少必要字段' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: '密码不一致' });
    }

    // 检查用户是否已存在
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: '邮箱已被注册' });
    }

    // 密码加密
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await User.create({
      username,
      email,
      password: hashedPassword
    });

    return res.status(201).json({
      message: '注册成功',
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (err) {
    console.error('注册错误:', err);
    return res.status(500).json({ message: '注册失败', error: err.message });
  }
});

// 登录
router.post('/login', passport.authenticate('local', { session: false }), (req, res) => {
  try {
    // 生成 JWT token
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      message: '登录成功',
      token,
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        isAdmin: req.user.isAdmin,
        isdisabled: req.user.isdisabled
      }
    });
  } catch (err) {
    console.error('登录错误:', err);
    return res.status(500).json({ message: '登录失败', error: err.message });
  }
});

// 获取当前用户信息（需要认证）
router.get('/me', passport.authenticate('jwt', { session: false }), (req, res) => {
  return res.json({
    id: req.user.id,
    username: req.user.username,
    email: req.user.email
  });
});

module.exports = router;
