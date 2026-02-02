// 初始化所有模型关联
const User = require('./User');
const Product = require('./Product');
const Cart = require('./Cart');

// User 和 Cart 的关联：一个用户可以有多个购物车项
User.hasMany(Cart, { foreignKey: 'userId', as: 'Carts' });
Cart.belongsTo(User, { foreignKey: 'userId', as: 'User' });

// Product 和 Cart 的关联：一个商品可以在多个购物车中
Product.hasMany(Cart, { foreignKey: 'productId', as: 'Carts' });
Cart.belongsTo(Product, { foreignKey: 'productId', as: 'Product' });

module.exports = {
  User,
  Product,
  Cart
};