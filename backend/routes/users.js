const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');

// 编辑用户信息
router.patch('/users/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        // 检查id是否为自己或管理员
        if (req.params.id !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ message: '无权限访问此资源' });
        }   

        const userId = req.params.id;
        const { username, email } = req.body;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: '用户未找到' });
        }

        // 更新用户信息
        if (username !== undefined) user.username = username;
        if (email !== undefined) user.email = email;

        await user.save();

        return res.json({
            message: '用户信息更新成功',
            user: { id: user.id, username: user.username, email: user.email }
        });
    } catch (err) {
        console.error('更新用户信息错误:', err);
        return res.status(500).json({ message: '更新用户信息失败', error: err.message });
    }
});
module.exports = router;