const alipayModule = require('alipay-sdk');
require('dotenv').config();
const path = require('path');
const fs = require('fs');

// 获取 AlipaySdk 构造函数
const AlipaySdk = alipayModule.AlipaySdk;

console.log('AlipaySdk:', AlipaySdk);
console.log('typeof AlipaySdk:', typeof AlipaySdk);

// 证书文件路径
const certDir = path.join(__dirname, '../certs');

// 读取证书内容 - 支持从文件或环境变量读取
function getCertContent(filename, envVar, base64EnvVar) {
  // 优先从环境变量读取 Base64 解码（Render 部署）
  if (base64EnvVar && process.env[base64EnvVar]) {
    console.log(`从环境变量 ${base64EnvVar}（Base64）读取证书`);
    try {
      const base64 = process.env[base64EnvVar];
      const buffer = Buffer.from(base64, 'base64');
      return buffer.toString('utf-8');
    } catch (error) {
      console.error(`Base64 解码失败: ${error.message}`);
      throw new Error(`证书 Base64 解码失败: ${base64EnvVar}`);
    }
  }
  
  // 其次从环境变量读取原始内容（Render 部署）
  if (envVar && process.env[envVar]) {
    console.log(`从环境变量 ${envVar}（原始内容）读取证书`);
    return process.env[envVar];
  }
  
  // 最后从文件读取（本地开发）
  const filePath = path.join(certDir, filename);
  if (fs.existsSync(filePath)) {
    console.log(`从文件 ${filePath} 读取证书`);
    return fs.readFileSync(filePath, 'utf-8');
  }
  
  // 都不存在则抛出错误
  throw new Error(`证书不存在：环境变量 ${envVar}/${base64EnvVar} 或文件 ${filePath}`);
}

// 读取证书文件内容
const appCertContent = getCertContent(
  'appPublicCert.crt', 
  'ALIPAY_APP_CERT_CONTENT',
  'ALIPAY_APP_CERT_BASE64'
);
const alipayPublicCertContent = getCertContent(
  'alipayPublicCert.crt', 
  'ALIPAY_PUBLIC_CERT_CONTENT',
  'ALIPAY_PUBLIC_CERT_BASE64'
);
const alipayRootCertContent = getCertContent(
  'alipayRootCert.crt', 
  'ALIPAY_ROOT_CERT_CONTENT',
  'ALIPAY_ROOT_CERT_BASE64'
);

// 创建支付宝 SDK 实例（证书方式）
const alipaySdk = new AlipaySdk({
  appId: process.env.ALIPAY_APP_ID,
  privateKey: process.env.ALIPAY_PRIVATE_KEY, // 应用私钥（字符串）
  appCertContent: appCertContent, // 应用公钥证书（内容）
  alipayPublicCertContent: alipayPublicCertContent, // 支付宝公钥证书（内容）
  alipayRootCertContent: alipayRootCertContent, // 支付宝根证书（内容）
  gateway: process.env.ALIPAY_GATEWAY || 'https://openapi.alipay.com/gateway.do',
  charset: 'utf-8',
  version: '1.0',
  signType: 'RSA2',
  timeout: 5000,
  camelCase: true
});

module.exports = {
  alipaySdk
};