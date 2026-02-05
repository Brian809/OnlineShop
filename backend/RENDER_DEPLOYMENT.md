# Render 部署配置指南

## 支付宝证书配置

由于 Render 不支持使用 `fs` 模块读取文件系统，我们需要将支付宝证书内容存储在环境变量中。

### 方法一：使用自动生成脚本（推荐）

1. **运行生成脚本**：
```bash
cd backend
./generate-payment-env-base64.sh
```

2. **复制生成的文件内容**：
```bash
cat payment.env
```

3. **在 Render 中添加环境变量**：
   - 复制 `ALIPAY_APP_CERT_BASE64` 的值
   - 复制 `ALIPAY_PUBLIC_CERT_BASE64` 的值
   - 复制 `ALIPAY_ROOT_CERT_BASE64` 的值
   - 复制 `ALIPAY_PRIVATE_KEY` 的值

### 方法二：手动转换

如果脚本无法运行，可以手动转换证书内容：

```bash
# 转换应用公钥证书
base64 -w 0 backend/certs/appPublicCert.crt

# 转换支付宝公钥证书
base64 -w 0 backend/certs/alipayPublicCert.crt

# 转换支付宝根证书
base64 -w 0 backend/certs/alipayRootCert.crt
```

### 必需的环境变量

在 Render 的 Environment Variables 中添加以下变量：

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `ALIPAY_APP_ID` | 支付宝应用ID | `9021000160613958` |
| `ALIPAY_PRIVATE_KEY` | 应用私钥 | `-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----` |
| `ALIPAY_APP_CERT_BASE64` | 应用公钥证书（Base64） | `LS0tLS1CRUdJTi...` |
| `ALIPAY_PUBLIC_CERT_BASE64` | 支付宝公钥证书（Base64） | `LS0tLS1CRUdJTi...` |
| `ALIPAY_ROOT_CERT_BASE64` | 支付宝根证书（Base64） | `LS0tLS1CRUdJTi...` |
| `ALIPAY_GATEWAY` | 支付宝网关地址 | `https://openapi.alipay.com/gateway.do` |
| `ALIPAY_NOTIFY_URL` | 异步通知地址 | `https://your-app.onrender.com/api/payment/notify` |
| `ALIPAY_RETURN_URL` | 同步返回地址 | `https://your-app.onrender.com/api/payment/return` |

### 重要提示

1. **不要提交证书文件到 Git**：
   - `payment.env` 已在 `.gitignore` 中
   - 证书文件（`.crt`）也在 `.gitignore` 中

2. **Base64 编码的优势**：
   - 可以正确保留证书中的换行符
   - 便于在 Render 中配置
   - 避免环境变量格式问题

3. **私钥格式**：
   - 必须包含 RSA 标识：`-----BEGIN RSA PRIVATE KEY-----`
   - 必须包含换行符（使用 `\n` 转义）

4. **测试配置**：
   - 部署后检查后端日志，确保证书正确加载
   - 查找 "从环境变量读取证书" 的日志输出

### 本地开发

本地开发时，代码会自动从 `backend/certs/` 目录读取证书文件，无需配置环境变量。

### 故障排查

**问题：证书加载失败**
```
解决方案：
1. 检查环境变量名称是否正确
2. 检查 Base64 编码是否完整
3. 查看后端日志中的错误信息
```

**问题：验签失败**
```
解决方案：
1. 确认使用的是应用私钥（不是支付宝的私钥）
2. 确认使用的是支付宝公钥（不是应用公钥）
3. 检查证书是否过期
```

**问题：支付创建失败**
```
解决方案：
1. 检查 ALIPAY_APP_ID 是否正确
2. 检查 ALIPAY_GATEWAY 地址是否正确
3. 查看支付宝错误码和错误信息
```