const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
const Product = require('../models/Product');
const fs = require('fs');
require('dotenv').config();

router.post('/uploadImage', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    // 假设图片数据在 req.body.imageData 中
    const { imageData } = req.body;

    if (!imageData) {
      return res.status(400).json({ message: '缺少图片数据' });
    }

    // 这里可以添加图片处理和存储逻辑
    // 例如，将图片保存到服务器或云存储，并返回图片URL

    if (process.env.NODE_ENV === 'development') {
      // save to static folder in development
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');
        const imageName = `image_${Date.now()}.png`;
        const imagePath = `./static/${imageName}`;
        fs.writeFileSync(imagePath, buffer);
        const imageUrl = `${req.protocol}://${req.get('host')}/static/${imageName}`;
    }
    else{
    const imageUrl = process.env.IMAGE_URL || 'http://example.com/path/to/image.jpg'; // 示例URL
    }
    return res.status(201).json({
      message: '图片上传成功',
      imageUrl
    });
  } catch (err) {
    console.error('图片上传错误:', err);
    return res.status(500).json({ message: '图片上传失败', error: err.message });
  }
});

module.exports = router;