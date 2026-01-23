const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// 获取所有产品
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll();
    return res.json(products);
  } catch (err) {
    console.error('获取产品列表错误:', err);
    return res.status(500).json({ message: '获取产品列表失败', error: err.message });
  }
});

// 获取单个产品
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

// 创建产品（管理员）
router.post('/', async (req, res) => {
  try {
    const { name, description, price, stock, category, image } = req.body;
    const product = await Product.create({
      name, description, price, stock, category, image
    });
    return res.status(201).json(product);
  } catch (err) {
    console.error('创建产品错误:', err);
    return res.status(500).json({ message: '创建产品失败', error: err.message });
  }
});

// 更新产品（管理员）
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: '产品不存在' });
    }
    await product.update(req.body);
    return res.json(product);
  } catch (err) {
    console.error('更新产品错误:', err);
    return res.status(500).json({ message: '更新产品失败', error: err.message });
  }
});

// 删除产品（管理员）
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: '产品不存在' });
    }
    await product.destroy();
    return res.json({ message: '产品已删除' });
  } catch (err) {
    console.error('删除产品错误:', err);
    return res.status(500).json({ message: '删除产品失败', error: err.message });
  }
});

module.exports = router;
