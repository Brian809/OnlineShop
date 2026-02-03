const express = require('express');
const router = express.Router();
const passport = require('passport');
const { saveBase64Image, getPresignedUrlSync, getPresignedUrl } = require('../utils/cosHelper');
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
    const imageKey = await saveBase64Image(imageData);
    console.log('腾讯云 COS 图片 Key:', imageKey);

    // 生成预签名 URL（用于前端直接显示）
    const signedUrl = getPresignedUrlSync(imageKey);
    console.log('预签名 URL:', signedUrl);

    console.log('返回上传成功响应');
    return res.status(201).json({
      message: '图片上传成功',
      imageKey,
      imageUrl: signedUrl
    });
  } catch (err) {
    console.error('图片上传错误:', err);
    return res.status(500).json({ message: '图片上传失败', error: err.message });
  }
});

// 获取预签名图片 URL（用于访问私有存储桶中的图片）
router.get('/image-url', async (req, res) => {
  try {
    const { key } = req.query;

    if (!key) {
      return res.status(400).json({ message: '缺少图片 key 参数' });
    }

    // 生成预签名 URL
    const signedUrl = getPresignedUrlSync(key);

    return res.json({
      key,
      imageUrl: signedUrl,
      expires: 7200 // URL 有效期（秒）
    });
  } catch (err) {
    console.error('获取图片 URL 错误:', err);
    return res.status(500).json({ message: '获取图片 URL 失败', error: err.message });
  }
});

// 批量获取预签名图片 URL
router.post('/batch-image-urls', async (req, res) => {
  try {
    const { keys } = req.body;

    if (!keys || !Array.isArray(keys)) {
      return res.status(400).json({ message: '缺少 keys 参数或格式不正确' });
    }

    // 批量生成预签名 URL
    const urls = keys.map(key => ({
      key,
      imageUrl: getPresignedUrlSync(key)
    }));

    return res.json({
      urls,
      expires: 7200 // URL 有效期（秒）
    });
  } catch (err) {
    console.error('批量获取图片 URL 错误:', err);
    return res.status(500).json({ message: '批量获取图片 URL 失败', error: err.message });
  }
});

module.exports = router;