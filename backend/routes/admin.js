const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
const Product = require('../models/Product');
require('dotenv').config();

// 获取所有用户（仅管理员可访问）
router.get('/users', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        // 检查是否为管理员
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: '无权限访问此资源' });
        }

        const users = await User.findAll({
            attributes: ['id', 'username', 'email', 'createdAt']
        });

        return res.json({ users });
    } catch (err) {
        console.error('获取用户列表错误:', err);
        return res.status(500).json({ message: '获取用户列表失败', error: err.message });
    }
});

// 删除用户（仅管理员可访问）
router.delete('/users/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        // 检查是否为管理员
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: '无权限访问此资源' });
        }

        const userId = req.params.id;
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ message: '用户未找到' });
        }
        await user.destroy();

        return res.json({ message: '用户删除成功' });
    } catch (err) {
        console.error('删除用户错误:', err);
        return res.status(500).json({ message: '删除用户失败', error: err.message });
    }
});



module.exports = router;
