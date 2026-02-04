# 订单系统功能说明

## 已实现的功能

### 1. 乐观锁库存扣减
- 使用 Sequelize 乐观锁机制防止库存超卖
- 创建订单时自动扣减库存
- 如果库存不足或商品已被修改，订单创建失败

### 2. 订单超时自动取消
- 订单创建后设置 30 分钟过期时间
- 定时任务每 5 分钟检查一次超时订单
- 超时订单自动取消并恢复库存

### 3. 订单状态管理
- `pending` - 待支付（默认状态）
- `paid` - 已支付
- `cancelled` - 已取消（超时或用户主动取消）
- `shipped` - 已发货
- `delivered` - 已送达
- `completed` - 已完成

## API 接口

### 创建订单
```http
POST /api/orders/create
Authorization: Bearer <token>

{
  "userId": 1,
  "productId": 1,
  "quantity": 2,
  "totalPrice": 199.99
}
```

**响应示例：**
```json
{
  "message": "订单创建成功",
  "order": {
    "id": 1,
    "userId": 1,
    "productId": 1,
    "quantity": 2,
    "totalPrice": 199.99,
    "status": "pending",
    "expiresAt": "2026-02-04T19:30:00.000Z",
    "createdAt": "2026-02-04T19:00:00.000Z"
  },
  "expiresAt": "2026-02-04T19:30:00.000Z"
}
```

### 获取用户订单列表
```http
GET /api/orders/user/:userId
Authorization: Bearer <token>
```

### 取消订单
```http
POST /api/orders/:id/cancel
Authorization: Bearer <token>
```

**响应示例：**
```json
{
  "message": "订单已取消，库存已恢复",
  "order": {
    "id": 1,
    "status": "cancelled"
  }
}
```

### 支付订单
```http
POST /api/orders/:id/pay
Authorization: Bearer <token>
```

**响应示例：**
```json
{
  "message": "支付成功",
  "order": {
    "id": 1,
    "status": "paid"
  }
}
```

## 数据库变更

### Product 表
- 新增 `version` 字段（乐观锁版本号）
- 启用 Sequelize 乐观锁机制

### Order 表
- 新增 `expiresAt` 字段（订单过期时间）
- 新增索引：`status`、`expiresAt`、`userId`

## 定时任务

自动取消超时订单的定时任务每 5 分钟执行一次：
- 查找所有 `status='pending'` 且 `expiresAt < 当前时间` 的订单
- 将这些订单的状态更新为 `cancelled`
- 恢复这些订单占用的库存

## 测试场景

### 场景 1：正常创建订单
1. 登录获取 Token
2. 查询商品信息，确认库存充足
3. 创建订单
4. 验证订单创建成功
5. 验证库存已扣减

### 场景 2：库存不足
1. 查询商品库存
2. 尝试创建数量超过库存的订单
3. 验证返回"库存不足"错误
4. 验证库存未变化

### 场景 3：并发订单（乐观锁测试）
1. 同时发起多个相同商品的订单请求
2. 验证只有部分订单创建成功
3. 验证库存不会变为负数

### 场景 4：订单超时取消
1. 创建订单
2. 修改数据库中 `expiresAt` 为过去时间
3. 执行定时任务脚本
4. 验证订单状态变为 `cancelled`
5. 验证库存已恢复

### 场景 5：用户主动取消订单
1. 创建订单
2. 调用取消订单接口
3. 验证订单状态变为 `cancelled`
4. 验证库存已恢复

### 场景 6：支付订单
1. 创建订单
2. 调用支付订单接口
3. 验证订单状态变为 `paid`
4. 验证库存保持扣减状态

## 运行定时任务

### 手动执行一次
```bash
cd backend
node useful_scripts/cancelExpiredOrders.js
```

### 自动运行（已集成到 app.js）
后端服务启动后会自动运行定时任务，每 5 分钟执行一次。

## 注意事项

1. **库存扣减是原子的**：使用事务确保库存扣减和订单创建要么都成功，要么都失败
2. **乐观锁机制**：防止并发请求导致的库存超卖问题
3. **订单过期时间**：默认为 30 分钟，可在代码中修改 `ORDER_TIMEOUT` 常量
4. **定时任务间隔**：默认为 5 分钟，可根据业务需求调整
5. **订单取消权限**：只能取消自己的订单，且只能是待支付状态
6. **订单支付权限**：只能支付自己的订单，且只能是待支付状态

## 性能优化

1. 使用数据库索引优化订单查询
2. 批量处理超时订单，减少数据库连接开销
3. 使用事务确保数据一致性

## 安全性

1. JWT 认证保护所有订单接口
2. 权限验证确保用户只能操作自己的订单
3. 参数验证防止无效请求