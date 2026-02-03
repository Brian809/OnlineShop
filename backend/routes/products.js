const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const passport = require('passport');
const fs = require('fs');
const path = require('path');
const qiniu = require('qiniu');
require('dotenv').config();

// 七牛云配置
const qiniuConfig = {
  accessKey: process.env.QIANNIU_ACCESS_KEY,
  secretKey: process.env.QIANNIU_SECRET_KEY,
  bucket: process.env.QIANNIU_BUCKET_NAME,
  domain: process.env.QIANNIU_DOMAIN,
  linkExpires: parseInt(process.env.QIANNIU_LINK_EXPIRES) || 3600 // 默认 1 小时
};

// 创建鉴权对象和 BucketManager
const mac = new qiniu.auth.digest.Mac(qiniuConfig.accessKey, qiniuConfig.secretKey);
const config = new qiniu.conf.Config();
const bucketManager = new qiniu.rs.BucketManager(mac, config);

// 生成七牛云上传凭证
function generateUploadToken() {
  const putPolicy = new qiniu.rs.PutPolicy({
    scope: qiniuConfig.bucket
  });
  return putPolicy.uploadToken(mac);
}

// 生成私有空间下载链接（带有效期）
function generatePrivateDownloadUrl(key) {
  // 确保域名格式正确
  let domain = qiniuConfig.domain;
  if (!domain.startsWith('http://') && !domain.startsWith('https://')) {
    domain = `https://${domain}`;
  }

  const deadline = parseInt(Date.now() / 1000) + qiniuConfig.linkExpires;
  return bucketManager.privateDownloadUrl(domain, key, deadline);
}

// 上传图片到七牛云
function uploadToQiniu(base64Data, fileName) {
  return new Promise((resolve, reject) => {
    const uploadToken = generateUploadToken();
    const formUploader = new qiniu.form_up.FormUploader(config);
    const putExtra = new qiniu.form_up.PutExtra();

    formUploader.put(uploadToken, fileName, base64Data, putExtra, (respErr, respBody, respInfo) => {
      if (respErr) {
        reject(respErr);
        return;
      }
      if (respInfo.statusCode === 200) {
        // 使用七牛云 API 生成私有空间下载链接
        const imageUrl = generatePrivateDownloadUrl(respBody.key);
        resolve(imageUrl);
      } else {
        reject(new Error(`上传失败: ${respInfo.statusCode}`));
      }
    });
  });
}

// 处理 base64 图片
async function saveBase64Image(base64Data) {
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

  // 开发环境：保存到本地静态文件夹
  if (process.env.NODE_ENV === 'development') {
    const imageName = `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${extension}`;
    const imagePath = path.join(__dirname, '..', 'public', 'static', imageName);

    // 确保目录存在
    const dir = path.dirname(imagePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 保存文件
    fs.writeFileSync(imagePath, buffer);

    // 返回本地 URI
    return `/static/${imageName}`;
  }

  // 生产环境：上传到七牛云
  try {
    const fileName = `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${extension}`;
    const imageUrl = await uploadToQiniu(buffer, fileName);
    return imageUrl;
  } catch (err) {
    console.error('七牛云上传失败:', err);
    return '';
  }
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

    // 处理主图片 - 如果是 base64，保存到静态文件夹或七牛云
    let imageUri = '';
    if (image) {
      imageUri = await saveBase64Image(image);
    }

    // 处理图片集合 - 如果有 base64，保存到静态文件夹或七牛云
    let picCollectionUris = [];
    if (picCollection && Array.isArray(picCollection)) {
      picCollectionUris = await Promise.all(picCollection.map(async (img) => {
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

    // 处理主图片 - 如果是 base64，保存到静态文件夹或七牛云
    if (updateData.image && updateData.image.startsWith('data:image/')) {
      updateData.image = await saveBase64Image(updateData.image);
    }

    // 处理图片集合 - 如果有 base64，保存到静态文件夹或七牛云
    if (updateData.picCollection && Array.isArray(updateData.picCollection)) {
      updateData.picCollection = await Promise.all(updateData.picCollection.map(async (img) => {
        if (img && img.startsWith('data:image/')) {
          return await saveBase64Image(img);
        }
        return img;
      }));
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
