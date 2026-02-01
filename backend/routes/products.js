const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const passport = require('passport');

// 获取所有产品（公开）
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll();
    return res.json(products);
  } catch (err) {
    console.error('获取产品列表错误:', err);
    return res.status(500).json({ message: '获取产品列表失败', error: err.message });
  }
});

// 获取单个产品（公开）
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: '产品不存在' });
    }
    return res.json(product);
  } catch (err) {
    console.error('获取产品错误:', err);
    return res.status(500).json({ message: '获取产品失败', error: err.message });
  }
});

// 创建产品（仅管理员）
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    // 检查是否为管理员
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: '无权限创建产品' });
    }

    const { name, description, price, stock, category, image, rating, picCollection } = req.body;

    // 基本验证
    if (!name || !price) {
      return res.status(400).json({ message: '商品名称和价格为必填项' });
    }

    const product = await Product.create({
      name,
      description,
      price,
      stock: stock || 0,
      category: category || '其他',
      image: image || '',
      rating: rating || 0,
      picCollection: picCollection ? JSON.stringify(picCollection) : null
    });

    return res.status(201).json({
      message: '商品创建成功',
      product
    });
  } catch (err) {
    console.error('创建产品错误:', err);
    return res.status(500).json({ message: '创建产品失败', error: err.message });
  }
});

// 更新产品（仅管理员）
router.patch('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    // 检查是否为管理员
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: '无权限更新产品' });
    }

    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: '产品不存在' });
    }

    // 如果有 picCollection，转换为 JSON 字符串
    if (req.body.picCollection) {
      req.body.picCollection = JSON.stringify(req.body.picCollection);
    }

    await product.update(req.body);

    return res.json({
      message: '商品更新成功',
      product
    });
  } catch (err) {
    console.error('更新产品错误:', err);
    return res.status(500).json({ message: '更新产品失败', error: err.message });
  }
});

// 删除产品（仅管理员）
router.delete('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    // 检查是否为管理员
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: '无权限删除产品' });
    }

    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: '产品不存在' });
    }
    await product.destroy();

    return res.json({ message: '商品删除成功' });
  } catch (err) {
    console.error('删除产品错误:', err);
    return res.status(500).json({ message: '删除产品失败', error: err.message });
  }
});

module.exports = router;
