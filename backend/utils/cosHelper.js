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
 * @returns {Promise<{key: string, url: string}>} 返回对象键和预签名 URL
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
        // 返回对象键和预签名 URL（用于私有存储桶访问）
        resolve({
          key: key,
          url: getPresignedUrlSync(key)
        });
      }
    );
  });
}

/**
 * 同步生成预签名 URL（用于上传后立即返回）
 * @param {string} key - 对象键
 * @returns {string} 预签名 URL
 */
function getPresignedUrlSync(key) {
  const url = cos.getObjectUrl({
    Bucket: cosConfig.Bucket,
    Region: cosConfig.Region,
    Key: key,
    Sign: true,
    Expires: 7200 // 2小时有效期
  });
  // 同步模式下直接返回 URL 字符串
  return url;
}

/**
 * 处理 base64 图片数据
 * 如果是 base64 格式，解码并上传到腾讯云 COS
 * @param {string} base64Data - base64 图片数据
 * @returns {Promise<string>} 图片对象键（用于后续生成预签名 URL）
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

  // 上传到腾讯云 COS，返回对象键
  const result = await uploadToCos(buffer, key);
  return result.key;
}

module.exports = {
  cos,
  getObjectUrl,
  getPresignedUrl,
  getPresignedUrlSync,
  uploadToCos,
  saveBase64Image
};