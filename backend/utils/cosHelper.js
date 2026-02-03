const COS = require('cos-nodejs-sdk-v5');
require('dotenv').config();

// 腾讯云 COS 配置
const cosConfig = {
  SecretId: process.env.TENCENT_COS_SECRET_ID,
  SecretKey: process.env.TENCENT_COS_SECRET_KEY,
  Bucket: process.env.TENCENT_COS_BUCKET,
  Region: process.env.TENCENT_COS_REGION,
  Domain: process.env.TENCENT_COS_DOMAIN
};

// 初始化 COS 实例
const cos = new COS({
  SecretId: cosConfig.SecretId,
  SecretKey: cosConfig.SecretKey
});

/**
 * 生成对象访问 URL（不带签名）
 * 用于私有读存储桶，需要配合 getObjectUrl 生成带签名的 URL
 * @param {string} key - 对象键
 * @returns {string} 对象访问 URL
 */
function getObjectUrl(key) {
  // 格式: https://{Bucket}.cos.{Region}.myqcloud.com/{key}
  return `https://${cosConfig.Bucket}.cos.${cosConfig.Region}.myqcloud.com/${key}`;
}

/**
 * 生成预签名 URL（带签名，用于临时访问）
 * @param {string} key - 对象键
 * @param {number} expires - 有效期（秒），默认 3600（1小时）
 * @returns {Promise<string>} 预签名 URL
 */
function getPresignedUrl(key, expires = 3600) {
  return new Promise((resolve, reject) => {
    cos.getObjectUrl(
      {
        Bucket: cosConfig.Bucket,
        Region: cosConfig.Region,
        Key: key,
        Sign: true,
        Expires: expires
      },
      function (err, data) {
        if (err) {
          reject(err);
          return;
        }
        resolve(data.Url);
      }
    );
  });
}

/**
 * 上传图片到腾讯云 COS
 * @param {Buffer} buffer - 图片二进制数据
 * @param {string} key - 对象键
 * @returns {Promise<string>} 对象访问 URL
 */
function uploadToCos(buffer, key) {
  return new Promise((resolve, reject) => {
    cos.putObject(
      {
        Bucket: cosConfig.Bucket,
        Region: cosConfig.Region,
        Key: key,
        Body: buffer
      },
      function (err, data) {
        if (err) {
          reject(err);
          return;
        }
        // 返回对象访问 URL（不带签名，存储桶需配置为私有读）
        resolve(getObjectUrl(key));
      }
    );
  });
}

/**
 * 处理 base64 图片数据
 * 如果是 base64 格式，解码并上传到腾讯云 COS
 * @param {string} base64Data - base64 图片数据
 * @returns {Promise<string>} 图片访问 URL
 */
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

  // 生成唯一文件名
  const key = `products/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${extension}`;

  // 上传到腾讯云 COS
  return await uploadToCos(buffer, key);
}

module.exports = {
  cos,
  getObjectUrl,
  getPresignedUrl,
  uploadToCos,
  saveBase64Image
};