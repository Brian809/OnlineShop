const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const passport = require('passport');
const fs = require('fs');
const path = require('path');

// 处理 base64 图片并保存到静态文件夹
function saveBase64Image(base64Data) {
  if (!base64Data || !base64Data.startsWith('data:image/')) {
    return '';
  }

  // 提取 MIME 类型和 base64 数据
  const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!matches) {
    return '';
  }

  const extension = matches[1];
  const imageData = matches[2];
  const buffer = Buffer.from(imageData, 'base64');

  // 生成文件名
  const imageName = `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${extension}`;
  const imagePath = '/home/brian/文档/Projects/OnlineShop/backend/public/static/' + imageName;

  // 确保目录存在
  const dir = path.dirname(imagePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // 保存文件
  fs.writeFileSync(imagePath, buffer);

  // 返回 URI
  return `/static/${imageName}`;
}

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

    // 处理主图片 - 如果是 base64，保存到静态文件夹
    let imageUri = '';
    if (image) {
      imageUri = saveBase64Image(image);
    }

    // 处理图片集合 - 如果有 base64，保存到静态文件夹
    let picCollectionUris = [];
    if (picCollection && Array.isArray(picCollection)) {
      picCollectionUris = picCollection.map(img => {
        if (img && img.startsWith('data:image/')) {
          return saveBase64Image(img);
        }
        return img;
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      stock: stock || 0,
      category: category || '其他',
      image: imageUri,
      rating: rating || 0,
      picCollection: picCollectionUris.length > 0 ? JSON.stringify(picCollectionUris) : null
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

    const updateData = { ...req.body };

    // 处理主图片 - 如果是 base64，保存到静态文件夹
    if (updateData.image && updateData.image.startsWith('data:image/')) {
      updateData.image = saveBase64Image(updateData.image);
    }

    // 处理图片集合 - 如果有 base64，保存到静态文件夹
    if (updateData.picCollection && Array.isArray(updateData.picCollection)) {
      updateData.picCollection = updateData.picCollection.map(img => {
        if (img && img.startsWith('data:image/')) {
          return saveBase64Image(img);
        }
        return img;
      });
      updateData.picCollection = JSON.stringify(updateData.picCollection);
    }

    await product.update(updateData);

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
