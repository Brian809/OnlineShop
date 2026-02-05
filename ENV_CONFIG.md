# 环境变量配置指南

## 概述

本项目使用环境变量来管理不同环境（开发、生产）的配置，避免硬编码，提高可维护性和安全性。

## 前端环境变量

### 配置文件位置
- `VueOnlineShop/.env` - 实际配置文件（不提交到 Git）
- `VueOnlineShop/.env.example` - 配置示例文件（提交到 Git）

### 环境变量说明

| 变量名 | 说明 | 示例值 | 必需 |
|--------|------|--------|------|
| `VITE_API_BASE_URL` | 后端 API 地址 | `http://localhost:3000/api` | 是 |
| `VITE_BACKEND_URL` | 后端服务器地址 | `http://localhost:3000` | 是 |

### 使用方法

1. 复制 `.env.example` 为 `.env`：
```bash
cd VueOnlineShop
cp .env.example .env
```

2. 根据实际情况修改 `.env` 文件中的配置

3. 重启前端服务使配置生效：
```bash
npm run dev
```

### 在代码中使用

```javascript
// 直接使用环境变量
const apiUrl = import.meta.env.VITE_API_BASE_URL;
const backendUrl = import.meta.env.VITE_BACKEND_URL;

// 示例：创建支付订单
const data = await post('/payment/create', {
  orderId: order.value.id,
  returnUrl: `${import.meta.env.VITE_BACKEND_URL}/api/payment/return`
});
```

### 生产环境配置

部署到生产环境时，将 `localhost` 替换为实际域名或服务器 IP：

```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_BACKEND_URL=https://api.yourdomain.com
```

## 后端环境变量

### 配置文件位置
- `backend/.env` - 实际配置文件（不提交到 Git）
- `backend/.env.example` - 配置示例文件（提交到 Git）

### 环境变量说明

| 变量名 | 说明 | 示例值 | 必需 |
|--------|------|--------|------|
| **数据库配置** |
| `DB_HOST` | 数据库主机 | `localhost` | 是 |
| `DB_PORT` | 数据库端口 | `3306` | 是 |
| `DB_NAME` | 数据库名称 | `onlineshop` | 是 |
| `DB_USER` | 数据库用户名 | `root` | 是 |
| `DB_PASSWORD` | 数据库密码 | `your_password` | 是 |
| **服务器配置** |
| `NODE_ENV` | 运行环境 | `development` / `production` | 是 |
| `PORT` | 服务器端口 | `3000` | 是 |
| **认证配置** |
| `JWT_SECRET` | JWT 密钥 | `your_jwt_secret` | 是 |
| `SESSION_SECRET` | Session 密钥 | `your_session_secret` | 是 |
| **跨域配置** |
| `CORS_ORIGIN` | 允许的前端地址 | `http://localhost:5173` | 是 |
| `FRONTEND_URL` | 前端地址（回调重定向） | `http://localhost:5173` | 是 |
| **数据库同步** |
| `SYNC_ALTER` | 是否同步表结构 | `true` / `false` | 否 |
| **腾讯云 COS** |
| `TENCENT_COS_SECRET_ID` | COS Secret ID | `your_secret_id` | 否 |
| `TENCENT_COS_SECRET_KEY` | COS Secret Key | `your_secret_key` | 否 |
| `TENCENT_COS_BUCKET` | COS 存储桶名称 | `your_bucket` | 否 |
| `TENCENT_COS_REGION` | COS 区域 | `ap-guangzhou` | 否 |
| `TENCENT_COS_DOMAIN` | COS 自定义域名 | `https://xxx.cos.ap-guangzhou.myqcloud.com` | 否 |
| **支付宝配置** |
| `ALIPAY_APP_ID` | 支付宝应用 ID | `9021000160613958` | 是 |
| `ALIPAY_PRIVATE_KEY` | 应用私钥 | `-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----` | 是 |
| `ALIPAY_PUBLIC_KEY` | 支付宝公钥 | `-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----` | 是 |
| `ALIPAY_GATEWAY` | 支付宝网关地址 | `https://openapi.alipay.com/gateway.do` | 是 |
| `ALIPAY_NOTIFY_URL` | 异步通知地址 | `https://your-domain.com/api/payment/notify` | 是 |
| `ALIPAY_RETURN_URL` | 同步返回地址 | `https://your-domain.com/api/payment/return` | 是 |

### 使用方法

1. 复制 `.env.example` 为 `.env`：
```bash
cd backend
cp .env.example .env
```

2. 根据实际情况修改 `.env` 文件中的配置

3. 重启后端服务使配置生效：
```bash
npm run dev
```

### 在代码中使用

```javascript
// 使用 process.env 访问环境变量
const backendUrl = process.env.FRONTEND_URL;
const corsOrigin = process.env.CORS_ORIGIN;

// 示例：支付回调重定向
res.redirect(`${process.env.FRONTEND_URL}/orders?success=true&orderId=${order.id}`);
```

### 生产环境配置

部署到生产环境时：

```env
# 生产环境配置
NODE_ENV=production
DB_HOST=your-production-db-host
DB_PASSWORD=your-production-password
CORS_ORIGIN=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
ALIPAY_GATEWAY=https://openapi.alipay.com/gateway.do
ALIPAY_NOTIFY_URL=https://yourdomain.com/api/payment/notify
ALIPAY_RETURN_URL=https://yourdomain.com/api/payment/return
```

## 开发环境配置

### 前端
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_BACKEND_URL=http://localhost:3000
```

### 后端
```env
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
ALIPAY_GATEWAY=https://openapi-sandbox.dl.alipaydev.com/gateway.do
ALIPAY_NOTIFY_URL=http://localhost:3000/api/payment/notify
ALIPAY_RETURN_URL=http://localhost:3000/api/payment/return
```

## 生产环境配置

### 前端
```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_BACKEND_URL=https://api.yourdomain.com
```

### 后端
```env
NODE_ENV=production
DB_HOST=your-production-db-host
CORS_ORIGIN=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
ALIPAY_GATEWAY=https://openapi.alipay.com/gateway.do
ALIPAY_NOTIFY_URL=https://yourdomain.com/api/payment/notify
ALIPAY_RETURN_URL=https://yourdomain.com/api/payment/return
```

## 安全注意事项

1. **不要提交 `.env` 文件到 Git**：`.env` 文件已添加到 `.gitignore`
2. **使用强密钥**：生产环境的 `JWT_SECRET` 和 `SESSION_SECRET` 应使用强随机字符串
3. **定期更换密钥**：定期更换敏感密钥以提高安全性
4. **环境隔离**：开发、测试、生产环境使用不同的配置
5. **访问控制**：确保 `.env` 文件权限设置为仅限服务器管理员访问

## 常见问题

### 1. 修改环境变量后没有生效
**原因**：环境变量在服务启动时加载，修改后需要重启服务。

**解决方法**：
```bash
# 前端
npm run dev

# 后端
npm run dev
```

### 2. 找不到环境变量
**原因**：前端环境变量必须以 `VITE_` 开头才能在 Vite 中使用。

**解决方法**：确保所有前端环境变量都以 `VITE_` 开头。

### 3. 生产环境部署后无法访问
**原因**：生产环境配置中的 `localhost` 需要替换为实际域名或 IP。

**解决方法**：检查并更新 `.env` 文件中的配置，确保使用正确的域名或 IP 地址。

## 相关文档

- [AGENTS.md](./AGENTS.md) - 项目完整文档
- [QUICKSTART.md](./QUICKSTART.md) - 快速开始指南
- [SETUP_COMPLETE.md](./SETUP_COMPLETE.md) - 设置完成指南