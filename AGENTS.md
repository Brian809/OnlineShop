# OnlineShop 项目文档

## 项目概述

OnlineShop 是一个全栈在线商城系统，由前端（Vue 3）和后端（Node.js + Express）两部分组成。项目提供完整的电商功能，包括用户认证、商品管理、购物车、订单管理等。

### 项目结构

```
OnlineShop/
├── VueOnlineShop/          # 前端项目
│   ├── src/
│   │   ├── components/     # 可复用组件
│   │   ├── views/          # 页面视图
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
│   └── package.json
│
└── AGENTS.md               # 项目文档
```

---

## 前端项目 (VueOnlineShop)

### 核心技术栈

- **框架**: Vue 3.5.26 (Composition API + `<script setup>`)
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
│   ├── card.vue         # 商品卡片组件
│   └── navbar.vue       # 导航栏组件
├── routers/             # 路由配置
│   └── index.js         # 路由定义
├── stores/              # Pinia 状态管理
│   ├── counter.js       # 示例 store（待替换）
│   └── user.js          # 用户状态管理
├── utils/               # 工具函数
│   └── api.js           # API 请求封装
└── views/               # 页面视图
    ├── Home.vue         # 首页（商品列表）
    ├── Login.vue        # 登录/注册页面
    └── admin/           # 管理后台
        └── userManagement.vue
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

项目配置的后端 API 地址：
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

#### 状态管理
- 使用 Pinia 进行全局状态管理
- Store 定义在 `src/stores/` 目录
- **user.js**: 用户认证状态管理，包含登录、登出、会话恢复等功能

#### API 请求封装
- `src/utils/api.js` 提供 API 请求工具函数
- 自动处理 Token 认证（Bearer Token）
- 提供 `get`、`post`、`put`、`del` 方法
- 统一错误处理

#### UI 组件使用
- 首选 Element Plus 组件库
- 全局导入：已在 `main.js` 中引入 `element-plus` 和样式

#### 响应式设计
- 遵循 Mobile First 设计原则
- 导航栏采用响应式设计：
  - 移动端：底部固定导航
  - 桌面端（>= 600px）：顶部导航

### 前端组件说明

#### Card 组件 (`src/components/card.vue`)

商品卡片组件，接收以下 props：
- `imageSrc` (String, 必需): 商品图片 URL
- `imageAlt` (String, 必需): 图片替代文本
- `title` (String, 必需): 商品标题
- `description` (String, 必需): 商品描述
- `price` (String, 必需): 商品价格

包含以下交互：
- 点击商品区域跳转到详情页（`go2InformationPage` 方法待实现）
- "Add to Cart" 按钮（`addToCart` 方法待实现）
- "Buy Now" 按钮（`buyNow` 方法待实现）

#### Navbar 组件 (`src/components/navbar.vue`)

导航栏组件，采用响应式设计：
- 移动端固定在底部
- 桌面端位于顶部
- 包含 Home、About、Contact、Login & Register 链接

#### 页面视图

##### Home.vue
- 首页展示商品列表
- 从后端 API 获取产品数据
- 处理空列表状态
- 使用 Card 组件渲染单个商品

##### Login.vue
- 登录/注册页面
- 使用 Element Plus 组件
- 集成用户认证 API

---

## 后端项目 (backend)

### 核心技术栈

- **框架**: Express.js 4.16.1
- **数据库**: MySQL (通过 Sequelize ORM 6.37.7)
- **认证**: Passport.js (JWT + Local Strategy)
- **会话**: express-session
- **其他依赖**:
  - bcryptjs (密码加密)
  - joi (数据验证)
  - cors (跨域支持)
  - dotenv (环境变量管理)

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
│   └── normalFunctions.js  # 通用功能路由
├── public/              # 静态资源
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
DB_NAME=onlineshop

# CORS 配置
CORS_ORIGIN=http://localhost:5173

# Session 配置
SESSION_SECRET=your_session_secret

# JWT 密钥
JWT_SECRET=your_jwt_secret
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

### 后端 API 路由

#### 认证相关 (`/api/auth`)
- `POST /register` - 用户注册
- `POST /login` - 用户登录
- `POST /logout` - 用户登出
- `GET /profile` - 获取用户信息

#### 商品相关 (`/api/products`)
- `GET /` - 获取商品列表
- `GET /:id` - 获取单个商品详情
- `POST /` - 创建商品（管理员）
- `PUT /:id` - 更新商品（管理员）
- `DELETE /:id` - 删除商品（管理员）

#### 用户相关 (`/api/users`)
- `GET /` - 获取用户列表
- `GET /:id` - 获取用户详情
- `PUT /:id` - 更新用户信息
- `DELETE /:id` - 删除用户

#### 管理员相关 (`/api/admin`)
- 管理后台专用接口

#### 通用功能 (`/api/normal`)
- 公共功能接口

#### 健康检查
- `GET /health` - 服务健康状态

### 后端数据模型

#### User 模型
- 用户基本信息
- 密码加密存储
- 认证凭证关联

#### Product 模型
- 商品信息
- 价格、库存等字段

#### Cart 模型
- 购物车数据
- 用户与商品的关联关系

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

## 待办事项

### 前端待办
- [ ] 实现 `card.vue` 中的 `go2InformationPage`、`addToCart` 和 `buyNow` 方法
- [ ] 完善 `Login.vue` 的登录/注册表单和验证逻辑
- [ ] 实现产品详情页路由和组件
- [ ] 实现购物车页面
- [ ] 实现订单管理页面
- [ ] 完善错误处理和加载状态
- [ ] 添加单元测试

### 后端待办
- [ ] 完善用户管理 API
- [ ] 实现购物车 API
- [ ] 实现订单管理 API
- [ ] 添加数据验证中间件
- [ ] 实现文件上传功能（商品图片）
- [ ] 添加 API 文档（Swagger）
- [ ] 实现支付集成

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
- phpMyAdmin

### API 测试
- Postman
- Thunder Client (VS Code 插件)

---

## 路径别名

前端项目配置了 `@` 别名指向 `src` 目录，可用于模块导入：
```javascript
import Component from '@/components/Component.vue'
import { useUserStore } from '@/stores/user'
```

---

## 技术规范

### 认证流程
1. 用户注册/登录获取 JWT Token
2. Token 存储在 localStorage
3. 每次请求自动在 Authorization header 添加 Bearer Token
4. 后端验证 Token 有效性和权限

### 错误处理
- API 请求失败时统一抛出错误
- 前端通过 Element Plus 的 Message 组件提示用户
- 后端返回标准化的错误响应格式

### 安全实践
- 密码使用 bcryptjs 加密
- 敏感信息通过环境变量配置
- CORS 限制允许的源地址
- Session 安全配置

---

## 注意事项

1. 确保 MySQL 服务正在运行
2. 确保 `.env` 文件已正确配置
3. 首次运行后端会自动创建数据库表
4. 前后端必须同时运行才能完整测试功能
5. 开发环境使用 HTTP，生产环境应使用 HTTPS