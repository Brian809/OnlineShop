const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Orders');
require('dotenv').config();

// 获取所有用户（仅管理员可访问）
router.get('/users', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        // 检查是否为管理员
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: '无权限访问此资源' });
        }

        const users = await User.findAll({
            attributes: ['id', 'username', 'email', 'createdAt', 'isdisabled', 'isAdmin', 'coin']
        });

        return res.json({ users });
    } catch (err) {
        console.error('获取用户列表错误:', err);
        return res.status(500).json({ message: '获取用户列表失败', error: err.message });
    }
});

// 创建用户（仅管理员可访问）
router.post('/users', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        // 检查是否为管理员
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: '无权限创建用户' });
        }

        const { username, email, password, confirmPassword, isAdmin } = req.body;

        // 基本验证
        if (!username || !email || !password || !confirmPassword) {
            return res.status(400).json({ message: '缺少必要字段' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: '密码不一致' });
        }

        // 检查用户名是否已存在
        const existingUsername = await User.findOne({ where: { username } });
        if (existingUsername) {
            return res.status(400).json({ message: '用户名已被使用' });
        }

        // 检查邮箱是否已存在
        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) {
            return res.status(400).json({ message: '邮箱已被注册' });
        }

        // 密码加密
        const hashedPassword = await bcrypt.hash(password, 10);

        // 创建用户
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            isAdmin: isAdmin || false  // 只有管理员可以设置 isAdmin 字段
        });

        return res.status(201).json({
            message: '用户创建成功',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin,
                isdisabled: user.isdisabled
            }
        });
    } catch (err) {
        console.error('创建用户错误:', err);
        return res.status(500).json({ message: '创建用户失败', error: err.message });
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

// 禁用&启用用户（仅管理员可访问）

router.put('/users/:id/toogleDisable', passport.authenticate('jwt', { session: false }), async (req, res) => {

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
        if (user.isdisabled) {
            user.isdisabled = false;
        } else {
            user.isdisabled = true;

        }
        await user.save();
        return res.json({ message: '用户状态已切换', isdisabled: user.isdisabled });
    } catch (err) {
        console.error('禁用用户错误:', err);
        return res.status(500).json({ message: '禁用用户失败', error: err.message });

    }

});

// 修改金币（仅管理员可访问）
router.put('/users/:id/coin', passport.authenticate('jwt', { session: false }), async (req, res) => {

    try {
        // 检查是否为管理员
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: '无权限访问此资源' });

        }
        const userId = req.params.id;
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: '金额必须大于 0' });
        }

        const user = await User.findByPk(userId);
        if (!user) {

            return res.status(404).json({ message: '用户未找到' });
        }

        // 更新用户余额
        user.coin = parseFloat(amount);
        await user.save();
        return res.json({
            message: '修改金币成功',
            coin: user.coin
        });

    } catch (err) {
        console.error('修改金币错误:', err);
        return res.status(500).json({ message: '修改金币失败', error: err.message });

    }

});

// 获取所有订单（仅管理员可访问）
router.get('/orders', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        // 检查是否为管理员
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: '无权限访问此资源' });
        }
        const orders = await Order.findAll({
            include: [
                { model: Product, as: 'Product' },
                { model: User, as: 'User', attributes: ['id', 'username', 'email'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        return res.json(orders);
    } catch (err) {
        console.error('获取订单错误:', err);
        return res.status(500).json({ message: '获取订单失败', error: err.message });
    }
});

// 获取用户地址列表（仅管理员可访问）
router.get('/users/:userId/addresses', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        // 检查是否为管理员
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: '无权限访问此资源' });
        }
        const { userId } = req.params;
        const Address = require('../models/Address');
        const addresses = await Address.findAll({
            where: { userId },
            order: [['isDefault', 'DESC'], ['createdAt', 'DESC']]
        });
        return res.json(addresses);
    } catch (err) {
        console.error('获取用户地址错误:', err);
        return res.status(500).json({ message: '获取用户地址失败', error: err.message });
    }
});

// 更新订单状态（仅管理员可访问），订单数据不可被删除，仅可更新状态
router.patch('/orders/:id/status', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        // 检查是否为管理员
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: '无权限访问此资源' });
        }
        const orderId = req.params.id;
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ message: '订单状态不能为空' });
        }
        const order = await Order.findByPk(orderId);
        if (!order) {
            return res.status(404).json({ message: '订单未找到' });
        }
        order.status = status;
        await order.save();
        return res.json({ message: '订单状态已更新', status: order.status });
    } catch (err) {
        console.error('更新订单状态错误:', err);
        return res.status(500).json({ message: '更新订单状态失败', error: err.message });
    }
});

module.exports = router;
