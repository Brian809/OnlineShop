# VueOnlineShop 快速开始指南

## 项目简介

VueOnlineShop 是一个全栈在线商城系统，前端使用 Vue 3 + Vite，后端使用 Node.js + Express + MySQL。

---

## 环境要求

- **Node.js**: ^20.19.0 || >=22.12.0
- **MySQL**: 5.7+ 或 8.0+
- **npm**: 最新版本

---

## 快速开始

### 1️⃣ 克隆项目

```bash
git clone <repository-url>
cd OnlineShop
```

### 2️⃣ 安装依赖

#### 后端依赖
```bash
cd backend
npm install
```

#### 前端依赖
```bash
cd ../VueOnlineShop
npm install
```

### 3️⃣ 配置数据库

#### 创建数据库
```bash
mysql -u root -p
# 输入密码后执行：
CREATE DATABASE test_onlineshop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

#### 配置环境变量

编辑 `backend/.env` 文件：

```env
# 服务器配置
PORT=3000
NODE_ENV=development

# 数据库配置
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_database_password
DB_NAME=test_onlineshop

# CORS 配置
CORS_ORIGIN=http://localhost:5173

# Session 配置
SESSION_SECRET=your_session_secret

# JWT 密钥
JWT_SECRET=your_jwt_secret

# 图片上传配置
IMAGE_URL=http://example.com/path/to/image.jpg
```

### 4️⃣ 设置管理员账户

```bash
cd backend
node setAdmin.js
```

按照提示输入要设置为管理员的用户邮箱。

### 5️⃣ 启动服务

#### 启动后端服务
```bash
cd backend
npm run dev
```

后端将在 `http://localhost:3000` 启动

#### 启动前端服务（新终端）
```bash
cd VueOnlineShop
npm run dev
```

前端将在 `http://localhost:5173` 启动

### 6️⃣ 访问应用

打开浏览器访问：http://localhost:5173

---

## 测试账号

### 管理员账号
- 邮箱: `admin@example.com`
- 密码: `admin123`

### 普通用户
可通过注册页面创建新用户。

---

## 项目结构

```
OnlineShop/
├── VueOnlineShop/          # 前端项目
│   ├── src/
│   │   ├── components/     # 组件
│   │   ├── views/          # 页面
│   │   ├── routers/        # 路由
│   │   ├── stores/         # 状态管理
│   │   └── utils/          # 工具函数
│   └── package.json
│
├── backend/                # 后端项目
│   ├── routes/             # API 路由
│   ├── models/             # 数据模型
│   ├── config/             # 配置文件
│   ├── public/             # 静态资源
│   └── package.json
│
├── AGENTS.md               # 项目文档
├── QUICKSTART.md           # 快速开始指南
└── roadmap.md              # 项目路线图
```

---

## 常用命令

### 后端
```bash
cd backend
npm run dev      # 开发模式（自动重启）
npm start        # 生产模式
```

### 前端
```bash
cd VueOnlineShop
npm run dev      # 开发模式
npm run build    # 生产构建
npm run preview  # 预览生产构建
```

---

## 核心功能

### 已实现
- ✅ 用户注册/登录（支持邮箱或用户名）
- ✅ JWT 认证
- ✅ 商品管理（CRUD）
- ✅ 用户管理（启用/禁用）
- ✅ 图片上传（开发环境本地存储）
- ✅ 管理员权限控制
- ✅ 响应式设计

### 待开发
- ⏳ 购物车功能
- ⏳ 订单系统
- ⏳ 支付集成
- ⏳ 商品详情页
- ⏳ 评价系统

---

## 文档

- **项目文档**: [AGENTS.md](AGENTS.md)
- **项目路线图**: [roadmap.md](roadmap.md)

---

## 常见问题

### 数据库连接失败
- 检查 MySQL 服务是否运行
- 确认 `.env` 文件中的数据库配置正确
- 确认数据库已创建

### 图片上传失败
- 确保 `backend/public/static/` 目录存在
- 检查请求体大小限制（10MB）

### 前端无法访问后端
- 确认后端服务在 3000 端口运行
- 检查 CORS 配置

---

## 技术栈

### 前端
- Vue 3.5.26 (Composition API)
- Vite 7.3.1
- Vue Router 4.6.4
- Pinia 3.0.4
- Element Plus 2.13.1

### 后端
- Express.js 4.16.1
- Sequelize 6.37.7
- Passport.js
- MySQL
- JWT

---

**开始开发吧！** 🚀