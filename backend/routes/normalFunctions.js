const express = require('express');
const router = express.Router();
const passport = require('passport');
const { saveBase64Image } = require('../utils/cosHelper');
require('dotenv').config();

router.post('/uploadImage', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    console.log('收到图片上传请求');
    const { imageData } = req.body;

    if (!imageData) {
      console.log('错误：缺少图片数据');
      return res.status(400).json({ message: '缺少图片数据' });
    }

    console.log('图片数据长度:', imageData.length);

    // 上传到腾讯云 COS
    console.log('上传到腾讯云 COS');
    const imageUrl = await saveBase64Image(imageData);
    console.log('腾讯云 COS 图片 URL:', imageUrl);

    console.log('返回上传成功响应');
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