const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');
const qiniu = require('qiniu');
require('dotenv').config();

// 七牛云配置
const qiniuConfig = {
  accessKey: process.env.QIANNIU_ACCESS_KEY,
  secretKey: process.env.QIANNIU_SECRET_KEY,
  bucket: process.env.QIANNIU_BUCKET_NAME,
  domain: process.env.QIANNIU_DOMAIN
};

// 生成七牛云上传凭证
function generateUploadToken() {
  const mac = new qiniu.auth.digest.Mac(qiniuConfig.accessKey, qiniuConfig.secretKey);
  const putPolicy = new qiniu.rs.PutPolicy({
    scope: qiniuConfig.bucket
  });
  return putPolicy.uploadToken(mac);
}

// 上传图片到七牛云
function uploadToQiniu(base64Data, fileName) {
  return new Promise((resolve, reject) => {
    const uploadToken = generateUploadToken();
    const config = new qiniu.conf.Config();
    const formUploader = new qiniu.form_up.FormUploader(config);
    const putExtra = new qiniu.form_up.PutExtra();

    formUploader.put(uploadToken, fileName, base64Data, putExtra, (respErr, respBody, respInfo) => {
      if (respErr) {
        reject(respErr);
        return;
      }
      if (respInfo.statusCode === 200) {
        // 七牛云返回的域名格式需要处理，去除协议前缀重复
        const domain = qiniuConfig.domain.replace(/^https?:\/\//, '');
        const imageUrl = `https://${domain}/${respBody.key}`;
        resolve(imageUrl);
      } else {
        reject(new Error(`上传失败: ${respInfo.statusCode}`));
      }
    });
  });
}

router.post('/uploadImage', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    console.log('收到图片上传请求');
    const { imageData } = req.body;

    if (!imageData) {
      console.log('错误：缺少图片数据');
      return res.status(400).json({ message: '缺少图片数据' });
    }

    console.log('图片数据长度:', imageData.length);

    let imageUrl;

    if (process.env.NODE_ENV === 'development') {
      // 开发环境：保存到本地 static 文件夹
      console.log('开发环境，保存到 static 文件夹');
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      const imageName = `image_${Date.now()}.png`;
      const imagePath = path.join(__dirname, '..', 'public', 'static', imageName);
      console.log('保存路径:', imagePath);
      fs.writeFileSync(imagePath, buffer);
      imageUrl = `${req.protocol}://${req.get('host')}/static/${imageName}`;
      console.log('图片 URL:', imageUrl);
    } else {
      // 生产环境：上传到七牛云
      console.log('生产环境，上传到七牛云');
      try {
        // 提取 base64 数据
        const matches = imageData.match(/^data:image\/(\w+);base64,(.+)$/);
        if (!matches) {
          throw new Error('无效的图片数据格式');
        }
        const extension = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');

        // 生成唯一文件名
        const fileName = `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${extension}`;

        // 上传到七牛云
        imageUrl = await uploadToQiniu(buffer, fileName);
        console.log('七牛云图片 URL:', imageUrl);
      } catch (uploadErr) {
        console.error('七牛云上传失败:', uploadErr);
        return res.status(500).json({ message: '图片上传失败', error: uploadErr.message });
      }
    }

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