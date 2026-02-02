# VueOnlineShop 项目文档

## 项目概述

VueOnlineShop 是一个全栈在线商城系统，由前端（Vue 3）和后端（Node.js + Express）两部分组成。项目提供完整的电商功能，包括用户认证、商品管理、用户管理、购物车、金币系统、图片上传等。图片存储支持开发环境（本地静态文件夹）和生产环境（图床）两种模式，数据库仅存储图片 URI 而非 base64 数据。

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
│   │   │   └── Login.vue   # 登录/注册页面
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
│   ├── public/             # 静态资源
│   │   └── static/         # 上传图片存储目录（开发环境）
│   ├── useful_scripts/     # 实用脚本
│   └── package.json
│
├── AGENTS.md               # 项目文档
├── QUICKSTART.md           # 快速开始指南
└── roadmap.md              # 项目路线图
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
- 点击商品区域跳转到详情页（`go2InformationPage` 方法待实现）
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
- 使用 `getImageUrl` 函数智能处理图片 URL：
  - base64 数据：直接返回
  - 相对路径（`/static/xxx.png`）：拼接后端地址
  - 完整 URL：直接返回
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
│   ├── User.js          # 用户模型
│   ├── Product.js       # 商品模型
│   └── Cart.js          # 购物车模型
├── routes/              # API 路由
│   ├── auth.js          # 认证路由
│   ├── users.js         # 用户路由
│   ├── products.js      # 商品路由
│   ├── admin.js         # 管理员路由
│   ├── cart.js          # 购物车路由
│   └── normalFunctions.js  # 通用功能路由
├── public/              # 静态资源
│   ├── images/          # 图片资源
│   ├── javascripts/     # JS 资源
│   ├── static/          # 上传图片存储目录（开发环境）
│   └── stylesheets/     # CSS 资源
├── useful_scripts/      # 实用脚本
│   ├── cleanup-indexes.js    # 清理索引脚本
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

# 图片上传配置
IMAGE_URL=http://example.com/path/to/image.jpg
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
  - 图片处理：接收 base64 格式，开发环境保存到静态文件夹，数据库存储 URI
  - 支持图片集合（picCollection）
- `PATCH /:id` - 更新商品（管理员）
  - 需要管理员权限
  - 支持更新所有字段
  - 图片处理：base64 自动转换为文件并保存 URI
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
  - 开发环境保存到 `backend/public/static/` 目录
  - 生产环境使用配置的图片 URL 或云存储（TODO）
  - 请求体大小限制：10MB
  - 返回：`{ message, imageUrl }`

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

#### Product 模型
- 商品信息（id, name, description, price, stock, category）
- 图片字段：image（STRING, 存储 URI）、picCollection（STRING, JSON 格式）
- 评分字段：rating
- 时间戳：createdAt, updatedAt

#### Cart 模型
- 购物车数据
- 用户与商品的关联关系
- 字段：userId, productId, quantity
- 支持数量累加

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

### 文件上传配置

#### 请求体大小限制
- `express.json({ limit: '10mb' })` - JSON 请求体
- `express.urlencoded({ extended: false, limit: '10mb' })` - URL 编码请求体
- 支持大文件（图片）上传

#### 图片存储策略
- **开发环境**（`NODE_ENV=development`）：
  - 保存到 `backend/public/static/` 目录
  - 文件名格式：`product_<timestamp>_<random>.<extension>`
  - URL 格式：`/static/product_xxx.jpeg`
  - 使用绝对路径保存，避免路径错误
- **生产环境**（`NODE_ENV=production`）：
  - 返回空字符串（TODO）
  - 需要实现图床上传逻辑
  - 未来将使用云存储服务

#### 图片处理函数
```javascript
function saveBase64Image(base64Data) {
  if (process.env.NODE_ENV === 'development') {
    // 提取 MIME 类型和 base64 数据
    const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
    const extension = matches[1];
    const imageData = matches[2];
    const buffer = Buffer.from(imageData, 'base64');

    // 生成唯一文件名
    const imageName = `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${extension}`;

    // 保存到本地
    fs.writeFileSync(imagePath, buffer);

    // 返回 URI
    return `/static/${imageName}`;
  }
  // 生产环境：返回空字符串（TODO: 实现图床上传）
  return '';
}
```

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
- 静态资源: http://localhost:3000/static/

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
| 阶段5 | 订单系统 | ⏳ 待开发 | ⭐⭐⭐⭐ |
| 阶段6 | 支付集成 | ⏳ 待开发 | ⭐⭐⭐ |
| 阶段7 | 用户个人中心 | ⏳ 待开发 | ⭐⭐⭐ |
| 阶段8 | 评价系统 | ⏳ 待开发 | ⭐⭐ |
| 阶段9 | 高级功能 | ⏳ 待开发 | ⭐⭐ |
| 阶段10 | 测试和部署 | ⏳ 待开发 | ⭐⭐⭐⭐ |

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
- ✅ 图片上传功能（base64 转文件）
- ✅ 开发/生产环境图片存储切换

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

### 第五阶段：订单系统 ⏳

#### 后端
- ⏳ 订单模型设计 (Order Model)
- ⏳ 订单项目模型 (OrderItem Model)
- ⏳ 创建订单接口 (POST /api/orders)
- ⏳ 获取订单列表接口 (GET /api/orders)
- ⏳ 获取订单详情接口 (GET /api/orders/:id)
- ⏳ 订单状态管理
- ⏳ 订单取消功能

#### 前端
- ⏳ 结算页面
- ⏳ 订单确认页面
- ⏳ 订单历史页面
- ⏳ 订单详情页面
- ⏳ 订单追踪

### 第六阶段：支付集成 ⏳

- ⏳ 支付网关集成（支付宝/微信支付）
- ⏳ 支付流程实现
- ⏳ 支付回调处理
- ⏳ 发票生成
- ⏳ 退款功能

### 第七阶段：用户个人中心 ⏳

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

### 第八阶段：评价和反馈系统 ⏳

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

### 第九阶段：高级功能 ⏳

- ⏳ 收藏夹功能
- ⏳ 优惠券系统
- ⏳ 商品推荐算法
- ⏳ 库存管理
- ⏳ 数据分析和报表
- ⏳ 消息通知系统
- ⏳ 搜索优化

### 第十阶段：测试和部署 ⏳

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
- ⏳ 生产环境图床配置

---

## 已知问题和优化项

### 待优化
- ⏳ 图片上传到图床（生产环境）
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
- [ ] 实现 `card.vue` 中的 `go2InformationPage`、`buyNow` 方法
- [ ] 实现产品详情页路由和组件
- [ ] 实现购物车结算页面
- [ ] 实现订单管理页面
- [ ] 完善错误处理和加载状态
- [ ] 添加单元测试

### 后端待办
- [ ] 实现订单管理 API
- [ ] 添加数据验证中间件（使用 joi）
- [ ] 添加 API 文档（Swagger）
- [ ] 实现支付集成
- [ ] **生产环境图片上传到图床**（如阿里云 OSS、七牛云等）

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

### 响应式设计
- 使用 Mobile First 原则
- 使用 CSS Grid 布局
- 媒体查询适配不同屏幕尺寸
- 导航栏响应式切换

### 图片处理规范
- 使用 `object-fit: cover` 防止图片变形
- 图片居中显示（`object-position: center`）
- 开发环境：保存到本地静态文件夹
- 生产环境：使用图床服务（待实现）
- 数据库只存储 URI，不存储 base64 数据

---

## 注意事项

1. 确保 MySQL 服务正在运行
2. 确保 `.env` 文件已正确配置
3. 首次运行后端会自动创建数据库表
4. 确保 `backend/public/static/` 目录存在，否则图片上传会失败
5. 前后端必须同时运行才能完整测试功能
6. 开发环境使用 HTTP，生产环境应使用 HTTPS
7. 使用 `setAdmin.js` 脚本设置管理员账户
8. 管理员用户可以访问 `/admin/users` 和 `/admin/products` 页面
9. 登录页面提供清除缓存功能用于调试
10. 图片上传支持最大 10MB 的请求体
11. Sequelize 查询必须使用 `where` 子句
12. 图片存储方式根据 `NODE_ENV` 自动切换：
    - `development`: 保存到 `backend/public/static/`
    - `production`: 返回空字符串（需实现图床上传）

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

### 图片上传失败
- 确认 `backend/public/static/` 目录存在
- 检查请求体大小（限制 10MB）
- 查看后端日志中的错误信息
- 检查图片格式和大小
- 确认开发环境配置正确（`NODE_ENV=development`）

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
- 项目使用国内占位符图片服务（placehold.co）
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

### 生产环境图片上传
- 当前生产环境返回空字符串
- 需要实现图床上传逻辑
- 推荐使用阿里云 OSS、七牛云等云存储服务

---

## 项目历史

### 最新更新
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
- **完善 Card 组件** - 实现 addToCart 方法
  - 支持添加商品到购物车
  - 集成购物车 API
- 优化图片显示 - 使用 `object-fit: cover` 防止图片变形
- 优化首页图片处理逻辑并支持开发/生产环境图片存储切换
- 修改图片存储方式 - base64 图片保存到静态文件夹，数据库只存储 URI
- 修改商品管理 - 使用表单上传图片（Element Plus el-upload）
- 实现完整的后台管理系统（用户管理、商品管理）
- 添加侧边导航栏组件（支持折叠/展开）
- 修复图片上传路径问题（使用绝对路径）
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