const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const passport = require('passport');
const { saveBase64Image, getPresignedUrlSync } = require('../utils/cosHelper');
require('dotenv').config();

/**
 * 从 COS URL 中提取对象 key
 * @param {string} url - COS URL
 * @returns {string} 对象 key
 */
function extractKeyFromUrl(url) {
  // 从完整 URL 中提取 key
  // 格式: https://vue-onlineshop-1316426653.cos.ap-guangzhou.myqcloud.com/products/xxx.jpeg
  // key: products/xxx.jpeg
  const match = url.match(/\/products\/(.+)$/);
  return match ? `products/${match[1]}` : url;
}

/**
 * 为产品对象添加预签名 URL
 * @param {Object} product - 产品对象
 * @returns {Object} 带有预签名 URL 的产品对象
 */
function addPresignedUrls(product) {
  const productData = product.toJSON();

  // 处理主图
  if (productData.image) {
    // 检查是 key 还是完整 URL
    const imageKey = productData.image.startsWith('http')
      ? extractKeyFromUrl(productData.image)
      : productData.image;
    productData.imageUrl = getPresignedUrlSync(imageKey);
  }

  // 处理图片集合
  if (productData.picCollection) {
    try {
      const picCollection = JSON.parse(productData.picCollection);
      productData.picCollectionUrls = picCollection.map(img => {
        const key = img.startsWith('http') ? extractKeyFromUrl(img) : img;
        return getPresignedUrlSync(key);
      });
    } catch (e) {
      console.error('解析 picCollection 失败:', e);
    }
  }

  // 处理详情图
  if (productData.detailImages) {
    try {
      const detailImages = JSON.parse(productData.detailImages);
      productData.detailImageUrls = detailImages.map(img => {
        const key = img.startsWith('http') ? extractKeyFromUrl(img) : img;
        return getPresignedUrlSync(key);
      });
    } catch (e) {
      console.error('解析 detailImages 失败:', e);
    }
  }

  return productData;
}

// 获取所有产品（公开）
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll();
    // 为每个产品添加预签名 URL
    const productsWithUrls = products.map(addPresignedUrls);
    return res.json(productsWithUrls);
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
    // 为产品添加预签名 URL
    const productWithUrls = addPresignedUrls(product);
    return res.json(productWithUrls);
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

    const { name, description, price, stock, category, image, rating, picCollection, detailImages } = req.body;

    // 基本验证
    if (!name || !price) {
      return res.status(400).json({ message: '商品名称和价格为必填项' });
    }

    // 处理主图片 - 如果是 base64，保存到静态文件夹或腾讯云 COS
    let imageUri = '';
    if (image) {
      imageUri = await saveBase64Image(image);
    }

    // 处理图片集合 - 如果有 base64，保存到静态文件夹或腾讯云 COS
    let picCollectionUris = [];
    if (picCollection && Array.isArray(picCollection)) {
      picCollectionUris = await Promise.all(picCollection.map(async (img) => {
        if (img && img.startsWith('data:image/')) {
          return await saveBase64Image(img);
        }
        return img;
      }));
    }

    // 处理详情图 - 如果有 base64，保存到静态文件夹或腾讯云 COS
    let detailImagesUris = [];
    if (detailImages && Array.isArray(detailImages)) {
      detailImagesUris = await Promise.all(detailImages.map(async (img) => {
        if (img && img.startsWith('data:image/')) {
          return await saveBase64Image(img);
        }
        return img;
      }));
    }

    const product = await Product.create({
      name,
      description,
      price,
      stock: stock || 0,
      category: category || '其他',
      image: imageUri,
      rating: rating || 0,
      picCollection: picCollectionUris.length > 0 ? JSON.stringify(picCollectionUris) : null,
      detailImages: detailImagesUris.length > 0 ? JSON.stringify(detailImagesUris) : null
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

    // 处理主图片 - 如果是 base64，保存到静态文件夹或腾讯云 COS
    if (updateData.image && updateData.image.startsWith('data:image/')) {
      updateData.image = await saveBase64Image(updateData.image);
    }

    // 处理图片集合 - 如果有 base64，保存到静态文件夹或腾讯云 COS
    if (updateData.picCollection && Array.isArray(updateData.picCollection)) {
      updateData.picCollection = await Promise.all(updateData.picCollection.map(async (img) => {
        if (img && img.startsWith('data:image/')) {
          return await saveBase64Image(img);
        }
        return img;
      }));
      updateData.picCollection = JSON.stringify(updateData.picCollection);
    }

    // 处理详情图 - 如果有 base64，保存到静态文件夹或腾讯云 COS
    if (updateData.detailImages && Array.isArray(updateData.detailImages)) {
      updateData.detailImages = await Promise.all(updateData.detailImages.map(async (img) => {
        if (img && img.startsWith('data:image/')) {
          return await saveBase64Image(img);
        }
        return img;
      }));
      updateData.detailImages = JSON.stringify(updateData.detailImages);
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
