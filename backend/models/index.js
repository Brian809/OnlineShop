// 初始化所有模型关联
const User = require('./User');
const Product = require('./Product');
const Cart = require('./Cart');
const Order = require('./Orders');
const Address = require('./Address');

// User 和 Cart 的关联：一个用户可以有多个购物车项
User.hasMany(Cart, { foreignKey: 'userId', as: 'Carts' });
Cart.belongsTo(User, { foreignKey: 'userId', as: 'User' });

// Product 和 Cart 的关联：一个商品可以在多个购物车中
Product.hasMany(Cart, { foreignKey: 'productId', as: 'Carts' });
Cart.belongsTo(Product, { foreignKey: 'productId', as: 'Product' });

// User 和 Order 的关联：一个用户可以有多个订单
User.hasMany(Order, { foreignKey: 'userId', as: 'Orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'User' });

// Product 和 Order 的关联：一个商品可以在多个订单中
Product.hasMany(Order, { foreignKey: 'productId', as: 'Orders' });
Order.belongsTo(Product, { foreignKey: 'productId', as: 'Product' });

// User 和 Address 的关联：一个用户可以有多个地址
User.hasMany(Address, { foreignKey: 'userId', as: 'Addresses' });
Address.belongsTo(User, { foreignKey: 'userId', as: 'User' });

// Address 和 Order 的关联：一个订单对应一个地址（可选）
Address.hasMany(Order, { foreignKey: 'addressId', as: 'Orders' });
Order.belongsTo(Address, { foreignKey: 'addressId', as: 'Address' });

module.exports = {
  User,
  Product,
  Cart,
  Order,
  Address
};