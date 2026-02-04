const express = require('express');
const router = express.Router();
const Order = require('../models/Orders');
const Product = require('../models/Product');
const passport = require('passport');
const sequelize = require('../config/database');

// 订单超时时间（毫秒）
const ORDER_TIMEOUT = 30 * 60 * 1000; // 30分钟

/**
 * 创建订单（带乐观锁库存扣减）
 */
router.post('/create', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { userId, productId, quantity, totalPrice, addressId } = req.body;
    
    // 参数验证
    if (!userId || !productId || !quantity || !totalPrice) {
      throw new Error('缺少必需参数');
    }
    
    if (quantity <= 0) {
      throw new Error('商品数量必须大于0');
    }
    
    // 验证用户身份
    if (req.user.id !== parseInt(userId)) {
      throw new Error('无权创建订单');
    }
    
    // 获取商品信息（带版本号）
    const product = await Product.findOne({
      where: { id: productId },
      transaction
    });
    
    if (!product) {
      throw new Error('商品不存在');
    }
    
    // 检查库存
    if (product.stock < quantity) {
      throw new Error('库存不足');
    }
    
    // 乐观锁扣减库存
    const [updatedCount] = await Product.update(
      { stock: sequelize.literal(`stock - ${quantity}`) },
      {
        where: {
          id: productId,
          stock: {
            [sequelize.Op.gte]: quantity // 确保库存足够
          }
        },
        transaction
      }
    );
    
    if (updatedCount === 0) {
      throw new Error('库存不足或商品已被修改');
    }
    
    // 处理地址信息
    let orderAddress = null;
    if (addressId) {
      const Address = require('../models/Address');
      const address = await Address.findOne({
        where: { id: addressId, userId }
      });
      
      if (!address) {
        throw new Error('地址不存在');
      }
      
      orderAddress = {
        addressId: address.id,
        receiverName: address.fullName,
        receiverPhone: address.phone,
        fullAddress: `${address.province}${address.city}${address.district}${address.detailAddress}`
      };
    }
    
    // 计算过期时间
    const expiresAt = new Date(Date.now() + ORDER_TIMEOUT);
    
    // 创建订单
    const order = await Order.create({
      userId,
      productId,
      quantity,
      totalPrice,
      status: 'pending',
      expiresAt,
      ...orderAddress
    }, { transaction });
    
    await transaction.commit();
    
    res.status(201).json({
      message: '订单创建成功',
      order,
      expiresAt
    });
  } catch (error) {
    await transaction.rollback();
    console.error('创建订单失败:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * 获取用户订单列表
 */
router.get('/user/:userId', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { userId } = req.params;
    
    // 权限验证
    if (req.user.id !== parseInt(userId)) {
      return res.status(403).json({ error: '无权访问此订单' });
    }
    
    const orders = await Order.findAll({
      where: { userId },
      include: [
        { model: Product, as: 'Product' },
        { model: require('../models/Address'), as: 'Address' }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json(orders);
  } catch (error) {
    console.error('获取订单列表失败:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * 取消订单（自动释放库存）
 */
router.post('/:id/cancel', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const orderId = req.params.id;
    
    // 获取订单信息
    const order = await Order.findOne({
      where: { id: orderId },
      include: [{ model: Product, as: 'Product' }],
      transaction
    });
    
    if (!order) {
      throw new Error('订单不存在');
    }
    
    // 权限验证
    if (req.user.id !== order.userId) {
      throw new Error('无权取消此订单');
    }
    
    // 只能取消待支付订单
    if (order.status !== 'pending') {
      throw new Error('只能取消待支付订单');
    }
    
    // 恢复库存（乐观锁）
    await Product.update(
      { stock: sequelize.literal(`stock + ${order.quantity}`) },
      {
        where: { id: order.productId },
        transaction
      }
    );
    
    // 更新订单状态
    await order.update({ status: 'cancelled' }, { transaction });
    
    await transaction.commit();
    
    res.status(200).json({
      message: '订单已取消，库存已恢复',
      order
    });
  } catch (error) {
    await transaction.rollback();
    console.error('取消订单失败:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * 支付订单
 */
router.post('/:id/pay', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const orderId = req.params.id;
    
    // 获取订单信息
    const order = await Order.findOne({
      where: { id: orderId },
      transaction
    });
    
    if (!order) {
      throw new Error('订单不存在');
    }
    
    // 权限验证
    if (req.user.id !== order.userId) {
      throw new Error('无权支付此订单');
    }
    
    // 只能支付待支付订单
    if (order.status !== 'pending') {
      throw new Error('订单状态不正确');
    }
    
    // 检查订单是否过期
    if (order.expiresAt && new Date() > order.expiresAt) {
      throw new Error('订单已过期');
    }
    
    // 更新订单状态
    await order.update({ status: 'paid' }, { transaction });
    
    await transaction.commit();
    
    res.status(200).json({
      message: '支付成功',
      order
    });
  } catch (error) {
    await transaction.rollback();
    console.error('支付订单失败:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;