# VueOnlineShop 项目文档

## 项目概述

VueOnlineShop 是一个全栈在线商城系统，由前端（Vue 3）和后端（Node.js + Express）两部分组成。项目提供完整的电商功能，包括用户认证、商品管理、用户管理、购物车、订单系统、金币系统、图片上传等。图片存储使用腾讯云 COS，数据库仅存储图片 URI 而非 base64 数据。

### 项目结构

```
OnlineShop/
├── VueOnlineShop/          # 前端项目
│   ├── src/
│   │   ├── components/     # 可复用组件
│   │   │   ├── admin/      # 管理后台组件
│   │   │   ├── card.vue    # 商品卡片组件
│   │   │   ├── cart.vue    # 购物车组件
│   │   │   ├── ImageUpload.vue  # 图片上传组件（待废弃）
│   │   │   └── navbar.vue  # 导航栏组件（响应式）
│   │   ├── views/          # 页面视图
│   │   │   ├── admin/      # 管理后台页面
│   │   │   ├── Home.vue    # 首页（商品列表）
│   │   │   ├── Login.vue   # 登录/注册页面
│   │   │   └── ProductDetail.vue  # 商品详情页
│   │   ├── routers/        # 路由配置
│   │   ├── stores/         # Pinia 状态管理
│   │   └── utils/          # 工具函数（API 请求等）
│   └── package.json
│
├── backend/                # 后端项目
│   ├── routes/             # API 路由
│   ├── models/             # Sequelize 数据模型
│   ├── config/             # 配置文件
│   ├── bin/                # 启动脚本
│   ├── utils/              # 工具函数
│   │   └── cosHelper.js    # 腾讯云 COS 辅助模块
│   ├── useful_scripts/     # 实用脚本
│   └── package.json
│
├── AGENTS.md               # 项目文档
├── QUICKSTART.md           # 快速开始指南
└── SETUP_COMPLETE.md       # 设置完成指南
```

---

## 前端项目 (VueOnlineShop)

### 核心技术栈

- **框架**: Vue 3.5.26 (使用 Composition API + `<script setup>`)
- **构建工具**: Vite 7.3.1
- **路由**: Vue Router 4.6.4
- **状态管理**: Pinia 3.0.4
- **UI 组件库**: Element Plus 2.13.1
- **开发工具**: Vue DevTools 8.0.5

### 前端项目架构

```
src/
├── App.vue              # 根组件
├── main.js              # 应用入口
├── components/          # 可复用组件
│   ├── admin/           # 管理后台组件
│   │   └── slideNavigationBar.vue  # 侧边导航栏
│   ├── card.vue         # 商品卡片组件
│   ├── cart.vue         # 购物车组件
│   ├── ImageUpload.vue  # 图片上传组件（已废弃）
│   └── navbar.vue       # 导航栏组件（响应式）
├── routers/             # 路由配置
│   └── index.js         # 路由定义 + 路由守卫
├── stores/              # Pinia 状态管理
│   ├── user.js          # 用户状态管理
│   └── counter.js       # 示例 store（待重构）
├── utils/               # 工具函数
│   └── api.js           # API 请求封装
└── views/               # 页面视图
    ├── Home.vue         # 首页（商品列表）
    ├── Login.vue        # 登录/注册页面
    ├── ProductDetail.vue # 商品详情页
    └── admin/           # 管理后台
        ├── userManagement.vue    # 用户管理页面
        └── productManagement.vue # 商品管理页面
```

### 前端构建和运行

#### 环境要求
- Node.js: ^20.19.0 || >=22.12.0

#### 常用命令

```bash
# 进入前端目录
cd VueOnlineShop

# 安装依赖
npm install

# 开发模式（热重载）
npm run dev

# 生产构建
npm run build

# 预览生产构建
npm run preview
```

#### 后端 API 配置

项目当前配置的后端 API 地址：
- API 基础 URL: `http://localhost:3000/api`

确保后端服务在开发环境中运行在 3000 端口。

### 前端开发约定

#### 代码风格
- **组件命名**: 使用 PascalCase（如 `Card.vue`、`Navbar.vue`）
- **脚本风格**: 优先使用 Composition API 的 `<script setup>` 语法
- **样式作用域**: 组件样式使用 `scoped` 属性避免样式污染

#### 路由配置
- 使用 Vue Router 的 History 模式
- 路由定义在 `src/routers/index.js`
- 当前路由：
  - `/` - 首页
  - `/login` - 登录/注册页面
  - `/product/:id` - 商品详情页
  - `/admin/users` - 用户管理页面（需要管理员权限）
  - `/admin/products` - 商品管理页面（需要管理员权限）

#### 路由守卫
- 实现了全局路由守卫，检查用户登录状态和权限
- 支持路由元信息：`requiresAuth`（需要登录）、`requiresAdmin`（需要管理员权限）
- 自动从 localStorage 恢复用户会话
- 未登录访问受保护页面时重定向到登录页
- 允许已登录用户访问登录页面（便于调试）

#### 状态管理
- 使用 Pinia 进行全局状态管理
- Store 定义在 `src/stores/` 目录
- **user.js**: 用户认证状态管理
  - 用户信息存储（包含 `isAdmin`、`isdisabled` 字段）
  - Token 管理
  - 登录/登出功能
  - 会话持久化（localStorage）
  - 自动恢复会话
- **counter.js**: 示例 store，待替换为业务相关逻辑（如购物车）

#### API 请求封装
- `src/utils/api.js` 提供 API 请求工具函数
- 自动处理 Token 认证（Bearer Token）
- 提供 `get`、`post`、`put`、`patch`、`del` 方法
- 统一错误处理
- 智能处理非 JSON 响应
- 认证接口（`/auth/login`、`/auth/register`）自动排除 token 携带

#### UI 组件使用
- 首选 Element Plus 组件库
- 全局导入：已在 `main.js` 中引入 `element-plus` 和样式
- 使用 Element Plus 图标增强视觉效果

#### 响应式设计
- 遵循 Mobile First 设计原则
- 导航栏采用响应式设计：
  - 移动端：底部固定导航
  - 桌面端（>= 600px）：顶部导航
- 购物车抽屉响应式适配

#### 图片显示规范
- 使用 `object-fit: cover` 防止图片变形
- 图片居中显示（`object-position: center`）
- 商品卡片图片尺寸：300x300px
- 图片 URL 直接使用，无需拼接后端地址（腾讯云 COS 返回完整 URL）

### 前端组件说明

#### Card 组件 (`src/components/card.vue`)

商品卡片组件，接收以下 props：
- `productId` (Number, 必需): 商品 ID
- `imageSrc` (String, 必需): 商品图片 URL
- `imageAlt` (String, 必需): 图片替代文本
- `title` (String, 必需): 商品标题
- `description` (String, 必需): 商品描述
- `price` (Number, 必需): 商品价格

包含以下交互：
- 点击商品区域跳转到详情页（`go2InformationPage` 方法已实现）
- "加入购物车" 按钮（`addToCart` 方法已实现）
- "立即购买" 按钮（`buyNow` 方法待实现）

图片显示特性：
- 使用 `object-fit: cover` 裁剪到 300x300px
- 图片居中显示，不变形

#### Cart 组件 (`src/components/cart.vue`)

购物车组件，提供完整的购物车功能：
- **浮动按钮**：右下角固定位置，点击打开购物车抽屉
- **抽屉式展示**：从右侧滑出，展示购物车内容
- **功能特性**：
  - 登录状态检查，未登录提示用户登录
  - 获取购物车数据（GET /api/cart）
  - 删除单个商品（DELETE /api/cart/:id）
  - 计算购物车总价
  - 支持商品数量累加
  - 结算功能（待实现）
- **响应式设计**：移动端全屏显示，桌面端固定宽度

#### Navbar 组件 (`src/components/navbar.vue`)

导航栏组件，采用响应式设计：
- **样式重构**：使用 Element Plus 图标增强视觉效果
- **移动端**：固定在底部，包含首页、关于、联系、登录/退出
- **桌面端**：位于顶部，包含首页、关于、联系、用户管理、商品管理、退出
- 根据登录状态和用户权限动态显示导航项
- 未登录：显示 Home、About、Contact、Login
- 已登录普通用户：显示 Home、About、Contact、Logout
- 已登录管理员：显示 Home、About、Contact、用户管理、商品管理、Logout
- 实现登出功能，清除用户会话

#### ImageUpload 组件 (`src/components/ImageUpload.vue`)

**已废弃** - 该组件不再使用，已被 Element Plus 的 `el-upload` 组件替代。

#### SlideNavigationBar 组件 (`src/components/admin/slideNavigationBar.vue`)

管理后台侧边导航栏：
- 折叠/展开切换功能
- 响应式设计
- 集成路由跳转
- 包含用户管理、商品管理等导航项
- 退出登录功能

#### 页面视图

##### Home.vue
- 首页展示商品列表
- 集成 Navbar 和 Cart 组件
- 使用 API 工具函数 `get('/products')` 获取商品数据
- 图片 URL 直接使用腾讯云 COS 返回的完整 URL
- 使用 Element Plus 的 `ElMessage` 显示错误提示
- 使用 Card 组件渲染单个商品
- 响应式 Grid 布局
- 无数据时显示空状态
- Banner 欢迎区域

##### Login.vue
- 登录/注册页面，支持模式切换
- 使用 Element Plus 表单组件
- 表单验证（用户名、邮箱、密码）
- 支持邮箱或用户名登录（后端智能识别）
- 记住密码功能
- 清除缓存调试功能
- 集成用户认证 API
- 登录成功后保存 `isAdmin` 和 `isdisabled` 字段
- 优化表单标签和提示文字
- 上下文相关的标签："登录账号"（登录）、"邮箱地址"（注册）

##### ProductDetail.vue
- 商品详情页面
- 显示商品主图、名称、描述、价格、库存、分类、评分
- 支持商品详情图展示（网格布局）
- 图片预览功能（点击放大）
- 加载状态和错误提示
- 响应式设计

##### userManagement.vue (admin/)
- 用户管理页面
- 仅管理员可访问
- 显示用户列表（ID、用户名、邮箱、管理员状态、金币余额、禁用状态、注册时间）
- 支持启用/禁用用户功能
- 支持创建新用户（带表单验证）
- 管理员可设置用户角色
- **新增**：修改用户金币功能
  - 打开修改金币对话框
  - 输入新余额（支持数字输入，精度 2 位小数）
  - 确认后更新用户余额
- 删除用户操作（带确认对话框）
- 刷新列表功能
- 集成侧边导航栏

##### productManagement.vue (admin/)
- 商品管理页面
- 仅管理员可访问
- 完整的商品 CRUD 操作
- 商品列表展示（图片、名称、描述、价格、库存、分类、评分）
- 创建/编辑商品对话框
- 使用 Element Plus 的 `el-upload` 组件上传图片
  - 支持图片选择、预览和删除
  - 图片自动转换为 base64 格式
  - 2MB 大小限制
- 表单验证（名称、描述、价格、库存）
- 分类选择
- 评分组件
- 支持图片集合（picCollection）
- 支持商品详情图（detailImages）
- 删除商品操作（带确认对话框）
- 刷新列表功能
- 集成侧边导航栏
- 图片预览使用 `object-fit: cover` 防止变形

---

## 后端项目 (backend)

### 核心技术栈

- **框架**: Express.js 4.16.1
- **数据库**: MySQL (通过 Sequelize ORM 6.37.7)
- **认证**: Passport.js (JWT + Local Strategy)
- **会话**: express-session
- **云存储**: 腾讯云 COS (cos-nodejs-sdk-v5)
- **其他依赖**:
  - bcryptjs (密码加密)
  - cors (跨域支持)
  - dotenv (环境变量管理)
  - jsonwebtoken (JWT Token 生成)
  - joi (数据验证)

### 后端项目架构

```
backend/
├── app.js               # Express 应用主文件
├── bin/
│   └── www              # 启动脚本
├── config/
│   ├── database.js      # Sequelize 数据库配置
│   └── passport.js      # Passport 认证配置
├── models/              # Sequelize 数据模型
│   ├── index.js         # 模型关联定义
│   ├── User.js          # 用户模型
│   ├── Product.js       # 商品模型
│   ├── Cart.js          # 购物车模型
│   └── Orders.js        # 订单模型
├── routes/              # API 路由
│   ├── auth.js          # 认证路由
│   ├── users.js         # 用户路由
│   ├── products.js      # 商品路由
│   ├── admin.js         # 管理员路由
│   ├── cart.js          # 购物车路由
│   ├── orders.js        # 订单路由
│   └── normalFunctions.js  # 通用功能路由
├── utils/               # 工具函数
│   └── cosHelper.js     # 腾讯云 COS 辅助模块
├── useful_scripts/      # 实用脚本
│   ├── cleanup-indexes.js    # 清理索引脚本
│   ├── migrate.js            # 数据库迁移脚本
│   └── setAdmin.js          # 管理员设置脚本
└── package.json
```

### 后端构建和运行

#### 环境配置

创建 `.env` 文件（参考 `.env.example`）：
```env
# 服务器配置
PORT=3000
NODE_ENV=development

# 数据库配置
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=test_onlineshop

# CORS 配置
CORS_ORIGIN=http://localhost:5173

# Session 配置
SESSION_SECRET=your_session_secret

# JWT 密钥
JWT_SECRET=your_jwt_secret

# 腾讯云 COS 对象存储配置
TENCENT_COS_SECRET_ID=your_tencent_cos_secret_id
TENCENT_COS_SECRET_KEY=your_tencent_cos_secret_key
TENCENT_COS_BUCKET=your_bucket_name
TENCENT_COS_REGION=ap_beijing
TENCENT_COS_DOMAIN=https://your_bucket_name.cos.ap_beijing.myqcloud.com
```

#### 常用命令

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 开发模式（使用 nodemon 热重载）
npm run dev

# 生产模式
npm start
```

#### 管理员设置

首次部署后，使用以下脚本将指定用户设置为管理员：
```bash
cd backend
node setAdmin.js
```

#### 数据库迁移

每次修改数据模型后，必须执行数据库迁移以同步数据库结构：

```bash
cd backend

# 安全模式（默认）- 仅创建新表，不修改现有表
node useful_scripts/migrate.js

# 强制模式 - 创建和修改表结构（开发环境）
node useful_scripts/migrate.js --force

# 跳过索引清理
node useful_scripts/migrate.js --no-cleanup

# 生产环境强制模式（需要设置环境变量）
FORCE_MIGRATE=true node useful_scripts/migrate.js --force
```

**迁移脚本特性**：
- 自动同步所有模型到数据库
- 支持安全模式和强制模式
- 自动清理重复索引
- 生产环境安全保护（默认禁用强制模式）
- 详细的迁移日志输出
- 从模型动态获取表名（无硬编码）

### 后端 API 路由

#### 认证相关 (`/api/auth`)
- `POST /register` - 用户注册
  - 请求体：`{ username, email, password, confirmPassword }`
  - 返回：`{ message, user: { id, username, email } }`
- `POST /login` - 用户登录
  - 请求体：`{ email, password }`（支持 email 或 username）
  - 返回：`{ message, token, user: { id, username, email, isAdmin, isdisabled } }`
  - 支持邮箱或用户名登录（通过 `@` 符号智能识别）
  - 检查用户是否被禁用（isdisabled）
- `GET /me` - 获取当前用户信息（需要认证）

#### 商品相关 (`/api/products`)
- `GET /` - 获取商品列表
- `GET /:id` - 获取单个商品详情
- `POST /` - 创建商品（管理员）
  - 请求体验证（名称、描述、价格、库存等）
  - 图片处理：接收 base64 格式，上传到腾讯云 COS
  - 支持图片集合（picCollection）
  - 支持商品详情图（detailImages）
- `PATCH /:id` - 更新商品（管理员）
  - 需要管理员权限
  - 支持更新所有字段
  - 图片处理：base64 自动上传到腾讯云 COS
- `DELETE /:id` - 删除商品（管理员）
  - 需要管理员权限

#### 购物车相关 (`/api/cart`)
- `GET /` - 获取当前用户的购物车（需要认证）
  - 返回购物车商品列表，包含商品详情
- `POST /add` - 添加商品到购物车（需要认证）
  - 请求体：`{ productId, quantity }`
  - 如果商品已存在，累加数量
- `DELETE /:id` - 删除单个购物车商品（需要认证）
  - 参数：购物车项目 ID
- `DELETE /removeSeveral` - 删除多个购物车商品（需要认证）
  - 请求体：`{ productIds }`（商品 ID 数组）

#### 订单相关 (`/api/orders`)
- `POST /create` - 创建订单（需要认证）
  - 请求体：`{ userId, productId, quantity, totalPrice }`
  - 返回：创建的订单对象
  - 订单状态默认为 'pending'
- `GET /user/:userId` - 获取指定用户的订单列表（需要认证）
  - 参数：用户 ID
  - 返回：订单列表，包含关联的商品详情
  - 权限验证：只能查看自己的订单

#### 用户相关 (`/api/users`)
- `GET /` - 获取用户列表
- `GET /:id` - 获取用户详情
- `PUT /:id` - 更新用户信息
- `DELETE /:id` - 删除用户

#### 管理员相关 (`/api/admin`)
- `GET /users` - 获取所有用户（仅管理员）
  - 返回用户列表，包含禁用状态、管理员状态、金币余额
- `POST /users` - 创建用户（仅管理员）
  - 支持设置 isAdmin 字段
  - 请求体验证
- `PUT /users/:id/toogleDisable` - 启用/禁用用户（仅管理员）
  - 切换用户的 isdisabled 状态
- `PUT /users/:id/coin` - 修改用户金币（仅管理员）
  - 请求体：`{ amount }`（新余额）
  - 更新用户的 coin 字段
- `DELETE /users/:id` - 删除用户（仅管理员）

#### 通用功能 (`/api/normal`)
- `POST /uploadImage` - 图片上传（需要认证）
  - 接收 base64 格式图片数据
  - 上传到腾讯云 COS
  - 请求体大小限制：10MB
  - 返回：`{ message, imageUrl }`

#### 支付相关 (`/api/payment`)
- `POST /create` - 创建支付订单（需要认证）
  - 请求体：`{ orderId, returnUrl }`
  - 返回：`{ message, payUrl }`（支付宝支付页面 URL）
  - 支持订单状态：pending, paying
- `GET /return` - 支付成功同步回调（支付宝跳转）
  - 接收支付宝回调参数
  - 主动查询支付宝支付状态并更新订单
  - 重定向到前端订单列表页面
- `POST /notify` - 支付成功异步通知（支付宝服务器回调）
  - 验证支付宝签名
  - 更新订单状态为 paid
  - 记录支付宝交易号和支付时间
- `GET /query/:orderId` - 查询支付状态（需要认证）
  - 调用支付宝查询接口
  - 返回：`{ status, order }`
- `POST /refund` - 申请退款（需要认证）
  - 请求体：`{ orderId, refundAmount }`
  - 调用支付宝退款接口
  - 更新订单状态为 refunded
  - 恢复库存

#### 健康检查
- `GET /health` - 服务健康状态

### 后端数据模型

#### User 模型
- 用户基本信息（id, username, email, password）
- `isAdmin` 字段（布尔值，默认 false）
- `isdisabled` 字段（布尔值，默认 false）
- **`coin` 字段**（DOUBLE，默认 0）：用户金币余额
- 扩展字段：firstName, lastName, phone, address, pic
- 密码加密存储（bcryptjs）
- 唯一性约束：username, email
- 关联：hasMany(Cart), hasMany(Order)

#### Product 模型
- 商品信息（id, name, description, price, stock, category）
- 图片字段：
  - `image`（STRING, 存储 URI）：商品主图
  - `picCollection`（STRING, JSON 格式）：商品详情图集合
  - `detailImages`（TEXT, JSON 格式）：商品详情图数组（用于详情页展示）
- 评分字段：rating
- 时间戳：createdAt, updatedAt
- 关联：hasMany(Cart), hasMany(Order)

#### Cart 模型
- 购物车数据
- 用户与商品的关联关系
- 字段：userId, productId, quantity
- 支持数量累加
- 关联：belongsTo(User), belongsTo(Product)

#### Order 模型（新增）
- 订单数据
- 字段：
  - `id` (INTEGER, 主键, 自增)
  - `userId` (INTEGER, 外键, 关联 User)
  - `productId` (INTEGER, 外键, 关联 Product)
  - `quantity` (INTEGER, 商品数量)
  - `totalPrice` (DECIMAL(10,2), 订单总价)
  - `status` (STRING, 订单状态, 默认 'pending')
  - `createdAt` (DATE, 创建时间)
  - `updatedAt` (DATE, 更新时间)
- 关联：belongsTo(User), belongsTo(Product)

### 模型关联关系

```
User (用户)
  ├─ hasMany(Cart)     一个用户有多个购物车项
  └─ hasMany(Order)    一个用户有多个订单

Product (商品)
  ├─ hasMany(Cart)     一个商品在多个购物车中
  └─ hasMany(Order)    一个商品在多个订单中

Cart (购物车)
  ├─ belongsTo(User)   属于一个用户
  └─ belongsTo(Product) 关联一个商品

Order (订单)
  ├─ belongsTo(User)   属于一个用户
  └─ belongsTo(Product) 关联一个商品
```

### 认证机制

#### Passport Local Strategy
- 配置使用 `email` 字段作为主要登录字段
- 智能识别输入：包含 `@` 按邮箱查找，不包含 `@` 按用户名查找
- 使用 Sequelize 正确语法：`User.findOne({ where: { email } })`
- 检查用户禁用状态（isdisabled）
- 密码使用 bcryptjs 验证
- 避免邮箱与用户名冲突时的登录歧义

#### JWT Token
- 登录成功后生成 JWT Token
- Token 有效期：7 天
- Payload 包含：id, email
- 前端通过 Authorization header 发送：`Bearer <token>`

#### JWT Strategy
- 从 `Authorization` header 提取 Token
- 验证 Token 有效性和签名
- 返回用户信息用于后续请求

### 腾讯云 COS 图片存储

#### COS 配置
所有 COS 相关配置通过环境变量设置：
- `TENCENT_COS_SECRET_ID`: 腾讯云 SecretId
- `TENCENT_COS_SECRET_KEY`: 腾讯云 SecretKey
- `TENCENT_COS_BUCKET`: 存储桶名称
- `TENCENT_COS_REGION`: 存储桶地域
- `TENCENT_COS_DOMAIN`: 自定义域名（可选）

#### 图片处理流程
1. 前端上传 base64 格式图片
2. 后端接收并解码 base64 数据
3. 生成唯一文件名（格式：`products/{timestamp}_{random}.{extension}`）
4. 上传到腾讯云 COS
5. 返回对象访问 URL
6. 数据库仅存储 URI

#### cosHelper.js 工具模块
提供以下功能：
- `saveBase64Image(base64Data)`: 处理 base64 图片并上传到 COS
- `getObjectUrl(key)`: 生成对象访问 URL
- `getPresignedUrl(key, expires)`: 生成预签名 URL（带签名）
- `uploadToCos(buffer, key)`: 上传二进制数据到 COS

### 文件上传配置

#### 请求体大小限制
- `express.json({ limit: '10mb' })` - JSON 请求体
- `express.urlencoded({ extended: false, limit: '10mb' })` - URL 编码请求体
- 支持大文件（图片）上传

---

## 开发工作流

### 完整开发环境启动

1. **启动后端服务**
```bash
cd backend
npm install
npm run dev
```

2. **启动前端服务**（新终端）
```bash
cd VueOnlineShop
npm install
npm run dev
```

3. 访问应用
- 前端: http://localhost:5173
- 后端: http://localhost:3000
- 健康检查: http://localhost:3000/health

### Git 工作流

```bash
# 查看当前状态
git status

# 添加文件
git add .

# 提交更改
git commit -m "描述更改内容"

# 推送到远程仓库
git push origin main
```

---

## 项目路线图

构建一个完整的 B2C 电商平台，包括商品展示、购物车、订单管理、用户认证等核心功能。

### 进度概览

| 阶段 | 功能 | 状态 | 优先级 |
|------|------|------|--------|
| 阶段1 | 项目基础设置 | ✅ 完成 | ⭐⭐⭐⭐⭐ |
| 阶段2 | 用户认证系统 | ✅ 完成 | ⭐⭐⭐⭐⭐ |
| 阶段3 | 商品管理系统 | ✅ 完成 | ⭐⭐⭐⭐⭐ |
| 阶段4 | 购物车功能 | ✅ 完成 | ⭐⭐⭐⭐ |
| 阶段5 | 商品详情页 | ✅ 完成 | ⭐⭐⭐⭐ |
| 阶段6 | 订单系统 | ✅ 完成 | ⭐⭐⭐⭐ |
| 阶段7 | 支付集成 | ⏳ 待开发 | ⭐⭐⭐ |
| 阶段8 | 用户个人中心 | ⏳ 待开发 | ⭐⭐⭐ |
| 阶段9 | 评价系统 | ⏳ 待开发 | ⭐⭐ |
| 阶段10 | 高级功能 | ⏳ 待开发 | ⭐⭐ |
| 阶段11 | 测试和部署 | ⏳ 待开发 | ⭐⭐⭐⭐ |

### 第一阶段：项目基础设置 ✅

#### 后端配置
- ✅ Express.js 框架搭建
- ✅ Passport.js 认证集成（Local + JWT）
- ✅ Sequelize ORM 配置
- ✅ MySQL 数据库连接
- ✅ 环境变量管理 (.env)
- ✅ CORS 跨域配置
- ✅ nodemon 自动重启

#### 前端配置
- ✅ Vue 3 + Vite 项目初始化
- ✅ Vue Router 路由配置
- ✅ Pinia 状态管理
- ✅ Element Plus UI 组件库
- ✅ API 请求封装

### 第二阶段：用户认证系统 ✅

#### 后端
- ✅ 用户模型设计 (User Model)
- ✅ 密码加密 (bcryptjs)
- ✅ Passport Local Strategy 实现
- ✅ JWT 令牌认证
- ✅ 注册接口 (POST /api/auth/register)
- ✅ 登录接口 (POST /api/auth/login)
- ✅ 支持邮箱或用户名登录
- ✅ 用户禁用功能
- ✅ 用户认证中间件

#### 前端
- ✅ 登录/注册页面
- ✅ 用户认证 store (user.js)
- ✅ 路由守卫
- ✅ Token 自动管理
- ✅ 登录状态持久化

### 第三阶段：商品管理系统 ✅

#### 后端
- ✅ 商品模型设计 (Product Model)
- ✅ 获取商品列表接口 (GET /api/products)
- ✅ 获取商品详情接口 (GET /api/products/:id)
- ✅ 创建商品接口 (POST /api/products) - 管理员
- ✅ 更新商品接口 (PATCH /api/products/:id) - 管理员
- ✅ 删除商品接口 (DELETE /api/products/:id) - 管理员
- ✅ 图片上传功能（base64 转腾讯云 COS）
- ✅ 支持图片集合（picCollection）
- ✅ 支持商品详情图（detailImages）

#### 前端
- ✅ 商品列表页面 (Home.vue)
- ✅ 商品管理页面 (productManagement.vue)
- ✅ 商品卡片组件 (card.vue)
- ✅ 图片上传组件（el-upload）
- ✅ 图片显示优化（object-fit: cover）
- ✅ 商品分类选择
- ✅ 商品评分展示

### 第四阶段：购物车功能 ✅

#### 后端
- ✅ 购物车模型完善 (Cart Model)
- ✅ 添加到购物车接口 (POST /api/cart/add)
- ✅ 获取购物车接口 (GET /api/cart)
- ✅ 删除购物车项目接口 (DELETE /api/cart/:id)
- ✅ 删除多个购物车商品接口 (DELETE /api/cart/removeSeveral)

#### 前端
- ✅ 购物车组件 (cart.vue)
- ✅ 添加商品到购物车（Card 组件）
- ✅ 删除商品功能
- ✅ 计算购物车总价
- ✅ 购物车数量累加
- ✅ 响应式抽屉式展示

### 第五阶段：商品详情页 ✅

#### 前端
- ✅ 商品详情页面 (ProductDetail.vue)
- ✅ 商品信息展示（主图、名称、描述、价格、库存、分类、评分）
- ✅ 商品详情图展示（网格布局）
- ✅ 图片预览功能
- ✅ 路由配置（/product/:id）
- ✅ Card 组件跳转功能

### 第六阶段：订单系统 ✅

#### 后端
- ✅ 订单模型设计 (Order Model)
- ✅ 模型关联配置（User-Order, Product-Order）
- ✅ 创建订单接口 (POST /api/orders/create)
- ✅ 获取用户订单列表接口 (GET /api/orders/user/:userId)
- ✅ 订单状态管理（status 字段）
- ✅ 权限验证（只能查看自己的订单）

#### 前端
- ⏳ 结算页面（待实现）
- ⏳ 订单确认页面（待实现）
- ⏳ 订单历史页面（待实现）
- ⏳ 订单详情页面（待实现）
- ⏳ 订单追踪（待实现）

### 第七阶段：支付集成 ✅

- ✅ 支付网关集成（支付宝沙箱环境）
- ✅ 支付流程实现（证书方式）
- ✅ 支付回调处理（同步回调 + 主动查询）
- ✅ 支付状态轮询（前端每3秒查询）
- ✅ 退款功能
- ⏳ 发票生成（待开发）

### 第八阶段：用户个人中心 ⏳

#### 后端
- ✅ 获取用户信息接口 (GET /api/auth/me)
- ✅ 更新用户信息接口 (PUT /api/users/:id)
- ✅ 修改用户金币接口 (PUT /api/admin/users/:id/coin)
- ⏳ 修改密码接口
- ⏳ 地址簿管理接口

#### 前端
- ⏳ 个人资料页面
- ⏳ 订单历史
- ⏳ 地址管理
- ⏳ 账户设置
- ⏳ 修改密码

### 第九阶段：评价和反馈系统 ⏳

#### 后端
- ⏳ 评价模型设计 (Review Model)
- ⏳ 创建评价接口
- ⏳ 获取商品评价接口
- ⏳ 删除评价接口
- ⏳ 评价审核功能

#### 前端
- ⏳ 评价列表展示
- ⏳ 发表评价功能
- ⏳ 评价管理
- ⏳ 评价统计

### 第十阶段：高级功能 ⏳

- ⏳ 收藏夹功能
- ⏳ 优惠券系统
- ⏳ 商品推荐算法
- ⏳ 库存管理
- ⏳ 数据分析和报表
- ⏳ 消息通知系统
- ⏳ 搜索优化

### 第十一阶段：测试和部署 ⏳

#### 测试
- ⏳ 后端单元测试
- ⏳ 集成测试
- ⏳ 前端组件测试
- ⏳ E2E 测试

#### 部署
- ⏳ Docker 容器化
- ⏳ 数据库备份策略
- ⏳ CI/CD 流程
- ⏳ 性能优化
- ⏳ 安全加固

---

## 已知问题和优化项

### 待优化
- ⏳ API 文档（Swagger）
- ⏳ 错误日志记录
- ⏳ 请求限流
- ⏳ 缓存优化

### 待修复
- ⏳ Sequelize 查询警告（确保所有查询使用 where 子句）
- ⏳ 前端错误边界处理

---

## 待办事项

### 前端待办
- [ ] 实现 `card.vue` 中的 `buyNow` 方法
- [ ] 实现购物车结算页面
- [ ] 实现订单管理页面（订单列表、订单详情）
- [ ] 实现订单历史页面
- [ ] 完善错误处理和加载状态
- [ ] 添加单元测试

### 后端待办
- [ ] 添加数据验证中间件（使用 joi）
- [ ] 添加 API 文档（Swagger）
- [ ] 生产环境部署配置
- [ ] 支付宝异步通知接口配置（需要公网域名）
- [ ] 发票生成功能
- [ ] 添加库存扣减逻辑（创建订单时）

---

## 开发工具推荐

### IDE
- VS Code + Vue (Official) 扩展（禁用 Vetur）
- VS Code + ESLint + Prettier

### 浏览器
- Chrome/Edge/Firefox 配合 Vue.js DevTools
- 启用 Custom Object Formatter 以获得更好的调试体验

### 数据库工具
- MySQL Workbench
- DBeaver

### API 测试
- Postman
- Thunder Client (VS Code 插件)
- curl 命令行工具

---

## 路径别名

前端项目配置了 `@` 别名指向 `src` 目录，可用于模块导入：
```javascript
import Component from '@/components/Component.vue'
import { useUserStore } from '@/stores/user'
import { post } from '@/utils/api'
```

---

## 技术规范

### 认证流程
1. 用户注册/登录获取 JWT Token
2. Token 存储在 localStorage
3. 每次请求自动在 Authorization header 添加 Bearer Token（除登录/注册接口外）
4. 后端验证 Token 有效性和权限
5. 登录时保存 `isAdmin` 和 `isdisabled` 字段用于权限判断

### 登录方式
- 支持邮箱登录：`admin@example.com`
- 支持用户名登录：`admin`
- 后端通过 `@` 符号智能识别
- 包含 `@` 按邮箱查找，不包含 `@` 按用户名查找
- 避免邮箱与用户名冲突
- 被禁用用户无法登录

### Sequelize 查询语法
- **正确语法**：`User.findOne({ where: { email } })`
- **错误语法**：`User.findOne({ email })`
- 所有查找查询必须使用 `where` 子句

### 错误处理
- API 请求失败时统一抛出错误
- 前端通过 Element Plus 的 Message 组件提示用户
- 后端返回标准化的错误响应格式
- 智能处理非 JSON 响应

### 安全实践
- 密码使用 bcryptjs 加密
- 敏感信息通过环境变量配置
- CORS 限制允许的源地址
- Session 安全配置
- JWT Token 有效期限制
- 被禁用用户无法登录
- 管理员权限检查
- 订单查询权限验证（只能查看自己的订单）

### 响应式设计
- 使用 Mobile First 原则
- 使用 CSS Grid 布局
- 媒体查询适配不同屏幕尺寸
- 导航栏响应式切换

### 图片处理规范
- 使用 `object-fit: cover` 防止图片变形
- 图片居中显示（`object-position: center`）
- 图片上传到腾讯云 COS
- 数据库仅存储 URI，不存储 base64 数据
- 前端直接使用腾讯云 COS 返回的完整 URL

### 前后端开发协调规范

**开发规则**：每当后端修改完做前端的时候，要考虑新功能是否可以放在管理系统。

**规则详情**：
- 添加新的后端 API 时，同步考虑是否需要为管理员提供相应的管理界面
- 涉及用户数据的新功能（如地址管理、订单信息等），应在管理后台提供查询和管理入口
- 需要管理员操作的功能（如修改用户状态、订单管理等），必须提供对应的管理页面
- 遵循统一的管理后台风格和交互模式
- 确保管理员权限验证到位

**开发流程**：
1. 后端完成新功能 API 开发
2. 评估该功能是否需要管理后台支持
3. 如需要，创建或更新对应的管理页面（位于 `VueOnlineShop/src/views/admin/`）
4. 更新侧边导航栏（`VueOnlineShop/src/components/admin/slideNavigationBar.vue`）
5. 添加路由配置（`VueOnlineShop/src/routers/index.js`）
6. 确保管理员权限验证
7. 测试管理功能

**常见管理功能清单**：
- 用户管理：用户列表、用户详情、用户状态管理、用户地址查询
- 商品管理：商品列表、商品编辑、商品删除
- 订单管理：订单列表、订单状态更新、订单详情查看
- 系统管理：系统配置、日志查看等

### 数据库迁移规范

**强制要求**：每次修改数据模型（`backend/models/` 中的文件）后，必须执行数据库迁移。

**迁移时机**：
- 修改模型字段定义（添加、删除、修改字段类型）
- 修改模型约束（唯一约束、外键关联等）
- 修改索引配置
- 创建新模型

**迁移命令**：
```bash
cd backend
node useful_scripts/migrate.js
```

**迁移模式选择**：
- **安全模式**（默认）：仅创建不存在的表，不修改现有表结构
  - 适用于：添加新模型、新表
  - 命令：`node useful_scripts/migrate.js`
- **强制模式**：创建和修改表结构
  - 适用于：修改现有表结构（添加字段、修改字段类型等）
  - 命令：`node useful_scripts/migrate.js --force`
  - **警告**：生产环境需要设置 `FORCE_MIGRATE=true` 环境变量

**索引清理**：
- 迁移脚本会自动执行索引清理
- 检测并删除重复索引（保留主键和第一个索引）
- 如需跳过索引清理：`node useful_scripts/migrate.js --no-cleanup`

**生产环境注意事项**：
- 迁移前必须备份数据库
- 优先使用安全模式，避免强制修改表结构
- 如必须使用强制模式，需要设置 `FORCE_MIGRATE=true` 环境变量
- 建议在测试环境验证迁移脚本后再在生产环境执行

**开发流程**：
1. 修改模型文件（如 `backend/models/User.js`）
2. 执行迁移：`node useful_scripts/migrate.js --force`
3. 验证数据库结构：`mysql -u root -p -e "DESCRIBE onlineshop.users;"`
4. 测试应用功能
5. 提交代码时在提交信息中注明"已执行数据库迁移"

### 订单系统设计规范

#### 订单状态流转
```
pending（待处理）→ paid（已支付）→ shipped（已发货）→ delivered（已送达）→ completed（已完成）
                                              ↓
                                          cancelled（已取消）
```

#### 订单创建流程
1. 用户从购物车或商品详情页发起购买
2. 前端发送订单创建请求（包含 userId, productId, quantity, totalPrice）
3. 后端验证用户登录状态
4. 后端创建订单记录（status 默认为 'pending'）
5. 返回订单信息给前端
6. 前端跳转到订单确认或支付页面

#### 订单查询权限
- 普通用户：只能查询自己的订单
- 管理员：可以查询所有订单
- 使用 JWT Token 中的 userId 进行权限验证

---

## 注意事项

1. 确保 MySQL 服务正在运行
2. 确保 `.env` 文件已正确配置
3. 首次运行后端会自动创建数据库表
4. 前后端必须同时运行才能完整测试功能
5. 开发环境使用 HTTP，生产环境应使用 HTTPS
6. 使用 `setAdmin.js` 脚本设置管理员账户
7. 管理员用户可以访问 `/admin/users` 和 `/admin/products` 页面
8. 登录页面提供清除缓存功能用于调试
9. 图片上传支持最大 10MB 的请求体
10. Sequelize 查询必须使用 `where` 子句
11. 图片存储使用腾讯云 COS，确保 COS 配置正确
12. 订单创建后需要手动更新订单状态（待支付流程集成）
13. 创建订单时需要考虑库存扣减（待实现）

---

## 测试账号

### 管理员账号
- 邮箱: `admin@example.com`
- 密码: `admin123`
- 权限: 管理员（isAdmin: true）
- 金币: 默认 0（可通过管理后台修改）

### 普通用户
- 可以通过注册页面创建新用户
- 默认权限为普通用户（isAdmin: false）
- 默认金币: 0
- 被禁用用户无法登录（isdisabled: true）

---

## 常见问题

### 登录失败
- 检查是否使用正确的邮箱或用户名
- 确认密码正确
- 检查用户是否被禁用
- 查看浏览器控制台错误信息
- 检查后端服务是否正常运行
- 尝试使用"清除缓存"功能

### 购物车问题
- 确保用户已登录
- 检查后端 cart.js 路由是否正常加载
- 查看浏览器控制台错误信息
- 确认商品 ID 正确

### 订单问题
- 确保用户已登录
- 检查后端 orders.js 路由是否正常加载
- 验证请求参数（userId, productId, quantity, totalPrice）
- 确认用户有权限查看该订单（只能查看自己的订单）
- 检查数据库中的 orders 表是否存在

### 图片上传失败
- 检查请求体大小（限制 10MB）
- 查看后端日志中的错误信息
- 检查图片格式和大小
- 确认腾讯云 COS 配置正确

### 无法访问管理后台
- 确认用户是管理员（`isAdmin: true`）
- 检查路由守卫日志输出
- 重新登录确保 `isAdmin` 字段正确保存
- 使用 `setAdmin.js` 脚本设置管理员权限

### 金币修改失败
- 确认当前用户是管理员
- 检查输入金额是否大于 0
- 确认用户 ID 正确
- 查看后端日志错误信息

### 图片加载慢
- 项目使用腾讯云 COS 存储图片
- 如仍有问题，检查网络连接

### 路由守卫问题
- 登录页面提供"清除缓存"按钮
- 点击后清除 localStorage 并刷新页面
- 用于调试登录状态异常问题

### Sequelize 查询警告
- 确保所有 `findOne`、`findAll` 等查询使用 `where` 子句
- 正确：`User.findOne({ where: { email } })`
- 错误：`User.findOne({ email })`

### 图片显示变形
- 已使用 `object-fit: cover` 处理
- 图片会在固定尺寸容器中裁剪显示
- 确保样式正确加载

### 支付相关问题
- **错误码 AE150003030**：收款账号和付款账号一致
  - 原因：在沙箱环境中使用商家账号扫描自己创建的订单
  - 解决：使用沙箱买家账号扫码付款
- **订单状态未更新**：
  - 确保 ALIPAY_RETURN_URL 配置正确（http://localhost:3000/api/payment/return）
  - 检查后端日志中的支付宝查询结果
  - 支付完成后会主动查询支付宝接口确认支付状态
  - 支付完成后会自动跳转到订单列表页面
- **支付后跳转错误**：
  - 确保 Vite 代理配置正确（/api → http://localhost:3000）
  - 确保 returnUrl 指向后端地址而不是前端地址
- **验签出错**：
  - 确保 ALIPAY_PRIVATE_KEY 是应用私钥（RSA 格式）
  - 确保 ALIPAY_PUBLIC_KEY 是支付宝公钥（不是应用公钥）
  - 证书文件必须放在 backend/certs/ 目录
- **API 请求错误 Not Found**：
  - 确保 admin 路由使用 PATCH 方法而不是 PUT
  - 检查前端和后端的 HTTP 方法是否一致

---

## 项目历史

### 最新更新
- **新增支付宝支付系统** - 完整的支付集成模块
  - 后端：支付配置（证书方式，使用 alipay-sdk 4.14.0）
  - 后端：支付路由（POST /api/payment/create 创建支付，GET /api/payment/return 同步回调）
  - 后端：支付查询（GET /api/payment/query/:orderId 查询支付状态）
  - 后端：退款功能（POST /api/payment/refund 申请退款）
  - 前端：Payment.vue 支付页面（订单信息、倒计时、状态轮询）
  - 前端：支付状态自动检测（每 3 秒轮询）
  - 支付流程：pending → paying → paid → shipped → delivered → completed
  - 订单状态更新：支付成功后自动更新订单状态
  - 证书文件：appPublicCert.crt、alipayPublicCert.crt、alipayRootCert.crt
  - 支付宝沙箱环境集成
- **新增订单系统** - 完整的订单功能模块
  - 后端：Orders 模型（包含 userId, productId, quantity, totalPrice, status 字段）
  - 后端：订单路由（POST /api/orders/create 创建订单，GET /api/orders/user/:userId 获取用户订单）
  - 后端：模型关联配置（User-Order, Product-Order）
  - 后端：权限验证（只能查看自己的订单）
  - 订单状态管理（pending 状态待支付流程集成）
- **新增商品详情页** - 完整的商品详情展示功能
  - 前端：ProductDetail.vue 组件
  - 路由配置：/product/:id
  - 支持商品主图、详情图展示
  - 图片预览功能
  - Card 组件跳转功能已实现
- **迁移到腾讯云 COS** - 图片存储从本地改为腾讯云 COS
  - 新增 cosHelper.js 工具模块
  - 商品模型新增 detailImages 字段
  - 支持图片集合和详情图上传
  - 数据库仅存储 URI
- **新增数据库迁移脚本** - migrate.js
  - 支持安全模式和强制模式
  - 自动清理重复索引
  - 从模型动态获取表名（无硬编码）
  - 生产环境安全保护
- **新增购物车功能** - 完整的购物车 API 和前端组件
  - 后端：GET/POST/DELETE 购物车接口
  - 前端：Cart 组件（浮动按钮 + 抽屉式展示）
  - 支持：添加商品、删除商品、计算总价
- **新增金币系统** - 用户金币余额管理
  - User 模型新增 `coin` 字段
  - 管理后台支持修改用户金币
  - 用户管理页面显示金币余额
- **重构导航栏** - 使用 Element Plus 图标和样式
  - 更现代化的视觉效果
  - 响应式设计优化
- **完善 Card 组件** - 实现跳转详情页和添加购物车功能
- 优化图片显示 - 使用 `object-fit: cover` 防止图片变形
- 实现完整的后台管理系统（用户管理、商品管理）
- 添加侧边导航栏组件（支持折叠/展开）
- 增加请求体大小限制（10MB）
- 添加用户启用/禁用功能
- 优化登录/注册表单标签和提示
- 修复登录页面路由守卫问题
- 支持使用邮箱或用户名登录
- 修复登录 API 字段不匹配问题
- 修复登录逻辑冲突问题
- 修复 Navbar 组件的 isLoggedIn 错误
- 修复登录后 isAdmin 字段缺失的问题
- 替换图片占位符为国内服务
- 添加示例商品数据
---

## 支付系统配置说明

### 支付宝开发环境配置

#### 1. 获取应用信息
- 登录支付宝开放平台（https://open.alipay.com/）
- 进入控制台 → 研发服务 → 研发服务 → 沙箱
- 记录 APPID（例如：9021000160613958）

#### 2. 配置密钥（证书方式）
- 进入应用详情 → 开发信息 → 接口加签方式
- 选择"证书方式"
- 下载以下文件到 `backend/certs/` 目录：
  - `appPublicCert.crt` - 应用公钥证书
  - `alipayPublicCert.crt` - 支付宝公钥证书
  - `alipayRootCert.crt` - 支付宝根证书
- 复制应用私钥（包含 RSA 格式）到 `.env` 文件的 `ALIPAY_PRIVATE_KEY`

#### 3. 配置环境变量
在 `backend/.env` 文件中添加：
```bash
# 支付宝配置（证书方式）
ALIPAY_APP_ID=你的应用ID
ALIPAY_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
你的应用私钥内容
...
-----END RSA PRIVATE KEY-----"
ALIPAY_GATEWAY=https://openapi-sandbox.dl.alipaydev.com/gateway.do
ALIPAY_NOTIFY_URL=http://localhost:3000/api/payment/notify
ALIPAY_RETURN_URL=http://localhost:3000/api/payment/return
```

#### 4. 沙箱账号测试
- 在支付宝开放平台查看沙箱账号
- 使用**买家账号**登录手机支付宝
- 扫码支付（不能使用商家账号，否则会报错 AE150003030）

### 生产环境配置（待实施）

#### 1. 切换网关地址
```bash
ALIPAY_GATEWAY=https://openapi.alipay.com/gateway.do
```

#### 2. 配置异步通知 URL
- 需要一个公网可访问的域名
- 配置 `ALIPAY_NOTIFY_URL=https://your-domain.com/api/payment/notify`
- 在支付宝开放平台配置异步通知地址

#### 3. 配置同步返回 URL
```bash
ALIPAY_RETURN_URL=https://your-domain.com/api/payment/return
```

#### 4. 证书续期
- 证书有有效期（通常1年）
- 到期前需要在支付宝开放平台重新生成证书
- 下载新证书并替换 `backend/certs/` 目录中的文件

### 支付流程说明

#### 订单状态流转
```
pending（待支付）→ paying（支付中）→ paid（已支付）→ shipped（已发货）→ delivered（已送达）→ completed（已完成）
                                    ↓
                              cancelled（已取消）
```

#### 支付流程
1. 用户点击"立即支付"
2. 前端调用 `POST /api/payment/create` 创建支付订单
3. 后端调用支付宝接口生成支付链接
4. 跳转到支付宝支付页面
5. 用户扫码支付
6. 支付宝同步回调到 `/api/payment/return`
7. 后端主动查询支付状态并更新订单
8. 跳转到前端订单列表页面

#### 支付状态监测
- **同步回调**：支付完成后立即触发（可靠）
- **前端轮询**：支付页面每 3 秒查询一次支付状态（备用）
- **异步通知**：支付宝服务器回调（需要公网域名，生产环境使用）

### 常见问题解决

#### 错误码 AE150003030
- 原因：收款账号和付款账号一致
- 解决：使用沙箱买家账号扫码付款

#### 验签出错
- 检查 ALIPAY_PRIVATE_KEY 是否正确（应用私钥）
- 检查 ALIPAY_PUBLIC_KEY 是否正确（支付宝公钥，不是应用公钥）
- 确保证书文件路径正确
- 确保私钥格式包含 RSA 标识

#### 订单状态未更新
- 检查 ALIPAY_RETURN_URL 配置
- 检查后端日志中的支付宝查询结果
- 确保后端服务正常运行
- 检查网络连接

#### 类型转换错误
- 后端：使用 `parseFloat(order.totalPrice)` 转换字符串为数字
- 前端：使用 `parseFloat(order.totalPrice).toFixed(2)` 格式化金额

### 支付接口文档

#### 创建支付订单
```
POST /api/payment/create
Headers: Authorization: Bearer <token>
Body: {
  "orderId": 14,
  "returnUrl": "http://localhost:3000/api/payment/return"
}
Response: {
  "message": "创建支付订单成功",
  "payUrl": "https://openapi-sandbox.dl.alipaydev.com/gateway.do?..."
}
```

#### 查询支付状态
```
GET /api/payment/query/14
Headers: Authorization: Bearer <token>
Response: {
  "status": "paid",
  "order": {
    "id": 14,
    "status": "paid",
    "alipayTradeNo": "2026020422001494100508068377",
    "paidAt": "2026-02-04T14:56:22.000Z"
  }
}
```

#### 申请退款
```
POST /api/payment/refund
Headers: Authorization: Bearer <token>
Body: {
  "orderId": 14,
  "refundAmount": "7709.00"
}
Response: {
  "message": "退款成功",
  "refundId": "..."
}
```
