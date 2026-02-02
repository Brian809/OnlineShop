const express = require('express');
const router = express.Router();
const passport = require('passport');
const Cart = require('../models/Cart');
require('dotenv').config();

// 获取当前用户的购物车
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    console.log('获取购物车请求，用户 ID:', req.user?.id);
    const Product = require('../models/Product');
    const cart = await Cart.findAll({
      where: { userId: req.user.id },
      include: [{ model: Product, as: 'Product' }]
    });
    console.log('购物车数据:', cart);
    return res.json(cart);
  } catch (err) {
    console.error('获取购物车错误:', err);
    return res.status(500).json({ message: '获取购物车失败', error: err.message });
  }
});

// 添加商品到购物车
router.post('/add', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    const existingItem = await Cart.findOne({ where: { userId: req.user.id, productId } });
    if (existingItem) {
      existingItem.quantity = quantity;
      await existingItem.save();
      return res.json(existingItem);
    } else {
      const newItem = await Cart.create({ userId: req.user.id, productId, quantity });
      return res.status(201).json(newItem);
    }
  } catch (err) {
    console.error('添加到购物车错误:', err);
    return res.status(500).json({ message: '添加到购物车失败', error: err.message });
  }
});

// 清空，删除多个商品（必须在 /:id 之前）
router.delete('/removeSeveral', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { productIds } = req.body; // Expecting an array of product IDs
  try {
    const deleted = await Cart.destroy({ where: { userId: req.user.id, productId: productIds } });
    return res.json({ message: `${deleted} items removed from cart` });
  } catch (err) {
    console.error('从购物车移除多个商品错误:', err);
    return res.status(500).json({ message: '从购物车移除多个商品失败', error: err.message });
  }
});

// 删除单个购物车商品（必须在具体路由之后）
router.delete('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const cartItem = await Cart.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!cartItem) {
      return res.status(404).json({ message: '购物车商品不存在' });
    }
    await cartItem.destroy();
    return res.json({ message: '已从购物车移除' });
  } catch (err) {
    console.error('从购物车移除商品错误:', err);
    return res.status(500).json({ message: '从购物车移除商品失败', error: err.message });
  }
});

module.exports = router;