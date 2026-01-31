const sequelize = require('./config/database');
const User = require('./models/User');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');

    const user = await User.findByPk(1);
    if (user) {
      user.isAdmin = true;
      await user.save();
      console.log('管理员权限设置成功！用户:', user.username);
    } else {
      console.log('未找到 ID 为 1 的用户');
    }
    process.exit(0);
  } catch (err) {
    console.error('错误:', err.message);
    process.exit(1);
  }
})();