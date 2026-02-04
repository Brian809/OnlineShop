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

// 读取证书文件内容
const appCertContent = fs.readFileSync(path.join(certDir, 'appPublicCert.crt'), 'utf-8');
const alipayPublicCertContent = fs.readFileSync(path.join(certDir, 'alipayPublicCert.crt'), 'utf-8');
const alipayRootCertContent = fs.readFileSync(path.join(certDir, 'alipayRootCert.crt'), 'utf-8');

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