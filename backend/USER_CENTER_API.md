# 用户中心 API 文档

## 用户信息管理

### 获取当前用户信息
```http
GET /api/users/me
Authorization: Bearer <token>
```

**响应示例：**
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@example.com",
  "firstName": "张",
  "lastName": "三",
  "phone": "13800138000",
  "address": "北京市朝阳区",
  "pic": null,
  "isAdmin": true,
  "coin": 0,
  "createdAt": "2026-02-04T10:00:00.000Z"
}
```

### 更新用户基本信息
```http
PATCH /api/users/me
Authorization: Bearer <token>

{
  "username": "new_username",
  "email": "new_email@example.com",
  "firstName": "李",
  "lastName": "四",
  "phone": "13900139000",
  "address": "上海市浦东新区",
  "pic": "avatar_url"
}
```

**注意：**
- 用户名和邮箱不能与已有用户重复
- 所有字段都是可选的，只更新提供的字段

**响应示例：**
```json
{
  "message": "用户信息更新成功",
  "user": {
    "id": 1,
    "username": "new_username",
    "email": "new_email@example.com",
    "firstName": "李",
    "lastName": "四",
    "phone": "13900139000",
    "address": "上海市浦东新区",
    "pic": "avatar_url"
  }
}
```

### 修改密码
```http
PATCH /api/users/me/password
Authorization: Bearer <token>

{
  "oldPassword": "old_password",
  "newPassword": "new_password"
}
```

**验证规则：**
- 必须提供旧密码和新密码
- 新密码长度至少为 6 位
- 旧密码必须正确
- 新密码不能与旧密码相同

**响应示例：**
```json
{
  "message": "密码修改成功"
}
```

## 地址管理

### 获取地址列表
```http
GET /api/users/me/addresses
Authorization: Bearer <token>
```

**响应示例：**
```json
[
  {
    "id": 1,
    "userId": 1,
    "fullName": "张三",
    "phone": "13800138000",
    "province": "北京市",
    "city": "北京市",
    "district": "朝阳区",
    "detailAddress": "某某街道123号",
    "postalCode": "100000",
    "isDefault": true,
    "createdAt": "2026-02-04T10:00:00.000Z"
  }
]
```

### 添加地址
```http
POST /api/users/me/addresses
Authorization: Bearer <token>

{
  "fullName": "张三",
  "phone": "13800138000",
  "province": "北京市",
  "city": "北京市",
  "district": "朝阳区",
  "detailAddress": "某某街道123号",
  "postalCode": "100000",
  "isDefault": false
}
```

**必填字段：**
- fullName: 收货人姓名
- phone: 收货人手机号
- province: 省份
- city: 城市
- district: 区县
- detailAddress: 详细地址

**可选字段：**
- postalCode: 邮政编码
- isDefault: 是否设为默认地址（设为 true 会自动取消其他默认地址）

**响应示例：**
```json
{
  "message": "地址添加成功",
  "address": {
    "id": 2,
    "userId": 1,
    "fullName": "张三",
    "phone": "13800138000",
    "province": "北京市",
    "city": "北京市",
    "district": "朝阳区",
    "detailAddress": "某某街道123号",
    "postalCode": "100000",
    "isDefault": false,
    "createdAt": "2026-02-04T11:00:00.000Z"
  }
}
```

### 更新地址
```http
PUT /api/users/me/addresses/:addressId
Authorization: Bearer <token>

{
  "fullName": "李四",
  "phone": "13900139000",
  "province": "上海市",
  "city": "上海市",
  "district": "浦东新区",
  "detailAddress": "某某路456号",
  "postalCode": "200000",
  "isDefault": true
}
```

**注意：**
- 只能更新自己的地址
- 所有字段都是可选的，只更新提供的字段
- 设置为默认地址会自动取消其他默认地址

**响应示例：**
```json
{
  "message": "地址更新成功",
  "address": {
    "id": 2,
    "userId": 1,
    "fullName": "李四",
    "phone": "13900139000",
    "province": "上海市",
    "city": "上海市",
    "district": "浦东新区",
    "detailAddress": "某某路456号",
    "postalCode": "200000",
    "isDefault": true,
    "createdAt": "2026-02-04T11:00:00.000Z"
  }
}
```

### 删除地址
```http
DELETE /api/users/me/addresses/:addressId
Authorization: Bearer <token>
```

**注意：**
- 只能删除自己的地址

**响应示例：**
```json
{
  "message": "地址删除成功"
}
```

### 设置默认地址
```http
PATCH /api/users/me/addresses/:addressId/default
Authorization: Bearer <token>
```

**注意：**
- 只能设置自己的地址为默认
- 会自动取消其他默认地址

**响应示例：**
```json
{
  "message": "默认地址设置成功",
  "address": {
    "id": 2,
    "userId": 1,
    "fullName": "李四",
    "phone": "13900139000",
    "province": "上海市",
    "city": "上海市",
    "district": "浦东新区",
    "detailAddress": "某某路456号",
    "postalCode": "200000",
    "isDefault": true,
    "createdAt": "2026-02-04T11:00:00.000Z"
  }
}
```

## 订单与地址集成

### 创建订单（带地址）
```http
POST /api/orders/create
Authorization: Bearer <token>

{
  "userId": 1,
  "productId": 1,
  "quantity": 2,
  "totalPrice": 199.99,
  "addressId": 1
}
```

**注意：**
- addressId 是可选的
- 如果提供 addressId，会自动关联地址并保存收货人信息

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
    "addressId": 1,
    "receiverName": "张三",
    "receiverPhone": "13800138000",
    "fullAddress": "北京市北京市朝阳区某某街道123号",
    "expiresAt": "2026-02-04T19:30:00.000Z",
    "createdAt": "2026-02-04T19:00:00.000Z"
  },
  "expiresAt": "2026-02-04T19:30:00.000Z"
}
```

### 获取订单列表（包含地址信息）
```http
GET /api/orders/user/:userId
Authorization: Bearer <token>
```

**响应示例：**
```json
[
  {
    "id": 1,
    "userId": 1,
    "productId": 1,
    "quantity": 2,
    "totalPrice": 199.99,
    "status": "pending",
    "addressId": 1,
    "receiverName": "张三",
    "receiverPhone": "13800138000",
    "fullAddress": "北京市北京市朝阳区某某街道123号",
    "expiresAt": "2026-02-04T19:30:00.000Z",
    "createdAt": "2026-02-04T19:00:00.000Z",
    "Product": {
      "id": 1,
      "name": "商品名称",
      "price": 99.99,
      "image": "image_url"
    },
    "Address": {
      "id": 1,
      "fullName": "张三",
      "phone": "13800138000",
      "province": "北京市",
      "city": "北京市",
      "district": "朝阳区",
      "detailAddress": "某某街道123号"
    }
  }
]
```

## 数据库变更

### User 表
- 无结构变更

### Address 表（新建）
- `id`: 主键
- `userId`: 用户ID（外键）
- `fullName`: 收货人姓名
- `phone`: 收货人手机号
- `province`: 省份
- `city`: 城市
- `district`: 区县
- `detailAddress`: 详细地址
- `postalCode`: 邮政编码
- `isDefault`: 是否为默认地址
- `createdAt`: 创建时间
- `updatedAt`: 更新时间

### Order 表
- 新增 `addressId`: 收货地址ID（外键）
- 新增 `receiverName`: 收货人姓名
- 新增 `receiverPhone`: 收货人电话
- 新增 `fullAddress`: 完整收货地址

## 模型关联

```
User (用户)
  ├─ hasMany(Cart)     一个用户有多个购物车项
  ├─ hasMany(Order)    一个用户有多个订单
  └─ hasMany(Address)  一个用户有多个地址

Address (地址)
  ├─ belongsTo(User)   属于一个用户
  └─ hasMany(Order)    一个地址可以有多个订单

Order (订单)
  ├─ belongsTo(User)   属于一个用户
  ├─ belongsTo(Product) 关联一个商品
  └─ belongsTo(Address) 关联一个地址（可选）
```

## 权限说明

- 所有用户中心接口都需要 JWT 认证
- 用户只能访问和修改自己的信息
- 用户只能管理自己的地址
- 地址删除后关联的订单会保留收货人信息（通过外键 SET NULL）

## 错误码

- `400`: 请求参数错误
- `403`: 无权限访问
- `404`: 资源不存在
- `500`: 服务器内部错误