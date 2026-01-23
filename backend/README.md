# OnlineShop 后端配置指南

## 环境要求

- Node.js >= 14.0
- MySQL 5.7+ 或 PostgreSQL 12+
- npm 或 yarn

## 已安装依赖

### 核心依赖
- **express**: Web 框架
- **passport**: 认证中间件
  - `passport-local`: 本地登录策略
  - `passport-jwt`: JWT 认证策略
- **sequelize**: SQL ORM
- **mysql2**: MySQL 数据库驱动
- **bcryptjs**: 密码加密
- **express-session**: 会话管理
- **cors**: 跨域资源共享
- **jsonwebtoken**: JWT 令牌生成和验证
- **dotenv**: 环境变量管理
- **joi**: 数据验证

### 开发依赖
- **nodemon**: 自动重启服务器

## 配置步骤

### 1. 创建数据库

```sql
CREATE DATABASE onlineshop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置数据库连接：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=onlineshop
DB_USER=root
DB_PASSWORD=your_password

# 服务器配置
NODE_ENV=development
PORT=3000

# 认证配置
JWT_SECRET=your_jwt_secret_key_change_in_production
SESSION_SECRET=your_session_secret_key_change_in_production

# 跨域配置
CORS_ORIGIN=http://localhost:5173
```

### 3. 安装依赖

```bash
cd backend
npm install
```

### 4. 启动服务器

开发模式（带自动重启）：
```bash
npm run dev
```

生产模式：
```bash
npm start
```

服务器将在 `http://localhost:3000` 启动。

## API 接口文档

### 认证接口

#### 注册用户
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

响应：
```json
{
  "message": "注册成功",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

#### 登录
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

响应：
```json
{
  "message": "登录成功",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

#### 获取当前用户信息
```
GET /api/auth/me
Authorization: Bearer <token>
```

响应：
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com"
}
```

### 产品接口

#### 获取所有产品
```
GET /api/products
```

响应：
```json
[
  {
    "id": 1,
    "name": "产品名称",
    "description": "产品描述",
    "price": "99.99",
    "stock": 100,
    "category": "电子产品",
    "image": "image.jpg",
    "rating": 4.5,
    "createdAt": "2024-01-21T...",
    "updatedAt": "2024-01-21T..."
  }
]
```

#### 获取单个产品
```
GET /api/products/:id
```

#### 创建产品（管理员）
```
POST /api/products
Content-Type: application/json

{
  "name": "产品名称",
  "description": "产品描述",
  "price": 99.99,
  "stock": 100,
  "category": "电子产品",
  "image": "image.jpg"
}
```

#### 更新产品
```
PUT /api/products/:id
Content-Type: application/json

{
  "name": "新产品名称",
  "price": 89.99,
  "stock": 50
}
```

#### 删除产品
```
DELETE /api/products/:id
```

## 项目结构

```
backend/
├── config/
│   ├── database.js          # 数据库连接配置
│   └── passport.js          # Passport 认证配置
├── models/
│   ├── User.js              # 用户模型
│   ├── Product.js           # 产品模型
│   └── Cart.js              # 购物车模型
├── routes/
│   ├── auth.js              # 认证路由
│   └── products.js          # 产品路由
├── app.js                   # 主应用文件
├── .env                     # 环境变量（本地）
├── .env.example             # 环境变量示例
├── package.json             # 项目配置
└── bin/
    └── www                  # 服务器启动文件
```

## 下一步

1. **创建更多数据模型**：Order（订单）、OrderItem（订单项）、Review（评价）等
2. **实现购物车接口**：添加、更新、删除购物车项
3. **实现订单接口**：创建、获取、更新订单
4. **添加中间件**：认证检查、错误处理、日志记录
5. **数据验证**：使用 joi 验证请求数据
6. **错误处理**：统一的错误响应格式
7. **测试**：单元测试和集成测试

## 故障排除

### 数据库连接失败
- 检查数据库服务是否运行
- 验证 `.env` 中的数据库凭证是否正确
- 确保数据库已创建

### 端口占用错误
修改 `.env` 中的 `PORT` 值或杀死占用该端口的进程

### 模块缺失
运行 `npm install` 重新安装依赖

## 安全建议

1. **永远不要将 `.env` 提交到版本控制**
2. **在生产环境中更改所有密钥和密码**
3. **使用 HTTPS**
4. **验证所有用户输入**
5. **定期更新依赖包**
6. **使用环境变量存储敏感信息**

## 许可证

MIT
