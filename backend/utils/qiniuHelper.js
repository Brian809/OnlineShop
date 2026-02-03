const qiniu = require('qiniu');
require('dotenv').config();

// 七牛云配置
const qiniuConfig = {
  accessKey: process.env.QIANNIU_ACCESS_KEY,
  secretKey: process.env.QIANNIU_SECRET_KEY,
  bucket: process.env.QIANNIU_BUCKET_NAME,
  domain: process.env.QIANNIU_DOMAIN
};

/**
 * 提取真实的 CDN 域名
 * 如果域名包含 /domain/，提取后面的部分
 * @returns {string} 真实的 CDN 域名
 */
function getRealCdnDomain() {
  let domain = qiniuConfig.domain;
  // 如果域名包含 /domain/，提取后面的部分
  if (domain.includes('/domain/')) {
    domain = domain.split('/domain/')[1];
  }
  // 确保域名格式正确
  if (!domain.startsWith('http://') && !domain.startsWith('https://')) {
    domain = `https://${domain}`;
  }
  // 确保域名末尾没有斜杠
  return domain.replace(/\/$/, '');
}

/**
 * 生成七牛云上传凭证
 * @returns {string} 上传凭证
 */
function generateUploadToken() {
  const mac = new qiniu.auth.digest.Mac(qiniuConfig.accessKey, qiniuConfig.secretKey);
  const putPolicy = new qiniu.rs.PutPolicy({
    scope: qiniuConfig.bucket
  });
  return putPolicy.uploadToken(mac);
}

/**
 * 生成七牛云图片访问链接（CDN域名 + 文件名）
 * @param {string} fileName - 文件名
 * @returns {string} 图片访问链接
 */
function generateImageUrl(fileName) {
  const domain = getRealCdnDomain();
  return `${domain}/${fileName}`;
}

/**
 * 上传图片到七牛云
 * @param {Buffer} buffer - 图片二进制数据
 * @param {string} fileName - 文件名
 * @returns {Promise<string>} 图片访问链接
 */
function uploadToQiniu(buffer, fileName) {
  return new Promise((resolve, reject) => {
    const uploadToken = generateUploadToken();
    const config = new qiniu.conf.Config();
    const formUploader = new qiniu.form_up.FormUploader(config);
    const putExtra = new qiniu.form_up.PutExtra();

    formUploader.put(uploadToken, fileName, buffer, putExtra, (respErr, respBody, respInfo) => {
      if (respErr) {
        reject(respErr);
        return;
      }
      if (respInfo.statusCode === 200) {
        // 使用 CDN 域名 + 文件名生成访问链接
        const imageUrl = generateImageUrl(respBody.key);
        resolve(imageUrl);
      } else {
        reject(new Error(`上传失败: ${respInfo.statusCode}`));
      }
    });
  });
}

/**
 * 处理 base64 图片数据
 * 如果是 base64 格式，解码并上传到七牛云
 * @param {string} base64Data - base64 图片数据
 * @returns {Promise<string>} 图片访问链接
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
  const fileName = `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${extension}`;

  // 上传到七牛云
  return await uploadToQiniu(buffer, fileName);
}

module.exports = {
  generateUploadToken,
  generateImageUrl,
  uploadToQiniu,
  saveBase64Image,
  getRealCdnDomain
};