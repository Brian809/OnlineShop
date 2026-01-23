# 快速开始指南

## 项目设置完成 ✓

已成功配置好以下内容：

### 后端环境配置
✅ Express.js 框架
✅ Passport.js 认证系统（Local + JWT）
✅ Sequelize ORM + MySQL 数据库驱动
✅ 密码加密（bcryptjs）
✅ JWT 令牌管理
✅ CORS 跨域配置
✅ 环境变量管理

### 已创建的文件结构

```
backend/
├── config/
│   ├── database.js          # Sequelize 数据库配置
│   └── passport.js          # Passport 认证策略配置
├── models/
│   ├── User.js              # 用户模型
│   ├── Product.js           # 产品模型
│   └── Cart.js              # 购物车模型
├── routes/
│   ├── auth.js              # 认证相关接口
│   └── products.js          # 产品相关接口
├── app.js                   # 主应用配置
├── .env                     # 环境变量（本地开发）
├── .env.example             # 环境变量模板
└── README.md                # API 文档和配置指南
```

## 快速开始步骤

### 1️⃣ 创建数据库

使用 MySQL 客户端创建数据库：

```bash
mysql -u root -p
# 输入密码后执行：
CREATE DATABASE onlineshop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 2️⃣ 配置环境变量

编辑 `backend/.env` 文件，修改数据库连接信息：

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=onlineshop
DB_USER=root
DB_PASSWORD=你的数据库密码
```

### 3️⃣ 启动开发服务器

```bash
cd backend
npm run dev
```

服务器将在 `http://localhost:3000` 启动，自动重启功能已启用。

### 4️⃣ 测试 API

#### 注册新用户
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

#### 用户登录
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## 已安装的 npm 包

### 生产依赖
- `express` - Web 框架
- `passport` - 认证中间件
- `passport-local` - 本地登录策略
- `passport-jwt` - JWT 认证
- `sequelize` - ORM
- `mysql2` - MySQL 驱动
- `bcryptjs` - 密码加密
- `jsonwebtoken` - JWT 生成和验证
- `express-session` - 会话管理
- `cors` - 跨域处理
- `dotenv` - 环境变量
- `joi` - 数据验证
- `morgan` - HTTP 日志
- `cookie-parser` - Cookie 解析

### 开发依赖
- `nodemon` - 自动重启服务器

## 下一步任务

1. **修改数据库凭证** - 更新 `.env` 文件中的数据库密码
2. **启动服务器** - 运行 `npm run dev` 确保数据库连接正常
3. **创建更多模型** - Order（订单）、OrderItem、Review 等
4. **实现购物车接口** - 基于 Cart 模型创建路由
5. **前端集成** - 在 Vue 项目中添加 axios 并调用 API
6. **错误处理** - 统一的错误响应格式中间件
7. **数据验证** - 使用 joi 验证所有请求数据

## 常用命令

```bash
# 启动开发服务器（带自动重启）
npm run dev

# 启动生产服务器
npm start

# 查看已安装包列表
npm list

# 添加新包
npm install <package-name>
```

## 数据库表（自动创建）

运行服务器后，以下表将自动创建：
- `users` - 用户表
- `products` - 产品表
- `carts` - 购物车表

## API 文档位置

完整的 API 文档请查看：[backend/README.md](backend/README.md)

## 项目 Roadmap

完整的项目路线图请查看：[roadmap.md](roadmap.md)

---

**准备好了吗？** 修改 `.env` 文件，然后运行 `npm run dev` 开始开发吧！
