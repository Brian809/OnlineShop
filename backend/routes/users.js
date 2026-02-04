const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Address = require('../models/Address');
const { Sequelize } = require('sequelize');

// 获取当前用户信息
router.get('/me', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: '用户未找到' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('获取用户信息错误:', err);
    res.status(500).json({ message: '获取用户信息失败', error: err.message });
  }
});

// 更新用户基本信息
router.patch('/me', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email, firstName, lastName, phone, address, pic } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: '用户未找到' });
    }

    // 检查用户名是否被其他用户占用
    if (username && username !== user.username) {
      const existingUser = await User.findOne({
        where: {
          username,
          id: { [Sequelize.Op.ne]: userId }
        }
      });
      if (existingUser) {
        return res.status(400).json({ message: '用户名已被占用' });
      }
      user.username = username;
    }

    // 检查邮箱是否被其他用户占用
    if (email && email !== user.email) {
      const existingUser = await User.findOne({
        where: {
          email,
          id: { [Sequelize.Op.ne]: userId }
        }
      });
      if (existingUser) {
        return res.status(400).json({ message: '邮箱已被占用' });
      }
      user.email = email;
    }

    // 更新其他字段
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (pic !== undefined) user.pic = pic;

    await user.save();

    res.json({
      message: '用户信息更新成功',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        address: user.address,
        pic: user.pic
      }
    });
  } catch (err) {
    console.error('更新用户信息错误:', err);
    res.status(500).json({ message: '更新用户信息失败', error: err.message });
  }
});

// 修改密码
router.patch('/me/password', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: '请提供旧密码和新密码' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: '新密码长度至少为6位' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: '用户未找到' });
    }

    // 验证旧密码
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: '旧密码错误' });
    }

    // 检查新密码是否与旧密码相同
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ message: '新密码不能与旧密码相同' });
    }

    // 加密新密码
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.json({ message: '密码修改成功' });
  } catch (err) {
    console.error('修改密码错误:', err);
    res.status(500).json({ message: '修改密码失败', error: err.message });
  }
});

// 获取用户地址列表
router.get('/me/addresses', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const userId = req.user.id;
    const addresses = await Address.findAll({
      where: { userId },
      order: [['isDefault', 'DESC'], ['createdAt', 'DESC']]
    });
    res.json(addresses);
  } catch (err) {
    console.error('获取地址列表错误:', err);
    res.status(500).json({ message: '获取地址列表失败', error: err.message });
  }
});

// 添加地址
router.post('/me/addresses', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, phone, province, city, district, detailAddress, postalCode, isDefault } = req.body;

    // 参数验证
    if (!fullName || !phone || !province || !city || !district || !detailAddress) {
      return res.status(400).json({ message: '请填写完整的地址信息' });
    }

    // 如果设置为默认地址，先取消其他默认地址
    if (isDefault) {
      await Address.update(
        { isDefault: false },
        { where: { userId } }
      );
    }

    const address = await Address.create({
      userId,
      fullName,
      phone,
      province,
      city,
      district,
      detailAddress,
      postalCode,
      isDefault: isDefault || false
    });

    res.status(201).json({
      message: '地址添加成功',
      address
    });
  } catch (err) {
    console.error('添加地址错误:', err);
    res.status(500).json({ message: '添加地址失败', error: err.message });
  }
});

// 更新地址
router.put('/me/addresses/:addressId', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.addressId;
    const { fullName, phone, province, city, district, detailAddress, postalCode, isDefault } = req.body;

    const address = await Address.findOne({
      where: { id: addressId, userId }
    });

    if (!address) {
      return res.status(404).json({ message: '地址未找到' });
    }

    // 如果设置为默认地址，先取消其他默认地址
    if (isDefault) {
      await Address.update(
        { isDefault: false },
        { where: { userId, id: { [Sequelize.Op.ne]: addressId } } }
      );
    }

    // 更新地址信息
    if (fullName !== undefined) address.fullName = fullName;
    if (phone !== undefined) address.phone = phone;
    if (province !== undefined) address.province = province;
    if (city !== undefined) address.city = city;
    if (district !== undefined) address.district = district;
    if (detailAddress !== undefined) address.detailAddress = detailAddress;
    if (postalCode !== undefined) address.postalCode = postalCode;
    if (isDefault !== undefined) address.isDefault = isDefault;

    await address.save();

    res.json({
      message: '地址更新成功',
      address
    });
  } catch (err) {
    console.error('更新地址错误:', err);
    res.status(500).json({ message: '更新地址失败', error: err.message });
  }
});

// 删除地址
router.delete('/me/addresses/:addressId', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.addressId;

    const address = await Address.findOne({
      where: { id: addressId, userId }
    });

    if (!address) {
      return res.status(404).json({ message: '地址未找到' });
    }

    await address.destroy();

    res.json({ message: '地址删除成功' });
  } catch (err) {
    console.error('删除地址错误:', err);
    res.status(500).json({ message: '删除地址失败', error: err.message });
  }
});

// 设置默认地址
router.patch('/me/addresses/:addressId/default', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.addressId;

    const address = await Address.findOne({
      where: { id: addressId, userId }
    });

    if (!address) {
      return res.status(404).json({ message: '地址未找到' });
    }

    // 取消其他默认地址
    await Address.update(
      { isDefault: false },
      { where: { userId } }
    );

    // 设置当前地址为默认
    address.isDefault = true;
    await address.save();

    res.json({
      message: '默认地址设置成功',
      address
    });
  } catch (err) {
    console.error('设置默认地址错误:', err);
    res.status(500).json({ message: '设置默认地址失败', error: err.message });
  }
});

// 编辑用户信息（保留原有接口，用于管理员）
router.patch('/users/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        // 检查id是否为自己或管理员
        if (req.params.id != req.user.id && !req.user.isAdmin) {
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