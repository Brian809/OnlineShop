/**
 * 清理 MySQL 中的重复索引
 * 使用方法：node cleanup-indexes.js
 */

const sequelize = require('../config/database');

async function cleanupIndexes() {
  try {
    console.log('开始清理索引...');

    // 显示 users 表的所有索引
    const [indexes] = await sequelize.query("SHOW INDEX FROM users");
    console.log('\nusers 表的索引:');
    indexes.forEach(idx => {
      console.log(`- ${idx.Key_name}: ${idx.Column_name} (${idx.Index_type})`);
    });

    // 检查是否有重复的 username 索引
    const usernameIndexes = indexes.filter(idx => idx.Column_name === 'username');
    if (usernameIndexes.length > 1) {
      console.log(`\n发现 ${usernameIndexes.length} 个 username 索引，需要清理...`);
      // 保留第一个，删除其他的
      for (let i = 1; i < usernameIndexes.length; i++) {
        const idx = usernameIndexes[i];
        console.log(`删除索引: ${idx.Key_name}`);
        await sequelize.query(`ALTER TABLE users DROP INDEX \`${idx.Key_name}\``);
      }
    }

    // 检查是否有重复的 email 索引
    const emailIndexes = indexes.filter(idx => idx.Column_name === 'email');
    if (emailIndexes.length > 1) {
      console.log(`\n发现 ${emailIndexes.length} 个 email 索引，需要清理...`);
      // 保留第一个，删除其他的
      for (let i = 1; i < emailIndexes.length; i++) {
        const idx = emailIndexes[i];
        console.log(`删除索引: ${idx.Key_name}`);
        await sequelize.query(`ALTER TABLE users DROP INDEX \`${idx.Key_name}\``);
      }
    }

    console.log('\n索引清理完成！');

    // 再次显示清理后的索引
    const [cleanedIndexes] = await sequelize.query("SHOW INDEX FROM users");
    console.log('\n清理后的索引:');
    cleanedIndexes.forEach(idx => {
      console.log(`- ${idx.Key_name}: ${idx.Column_name} (${idx.Index_type})`);
    });

  } catch (error) {
    console.error('清理索引失败:', error);
  } finally {
    await sequelize.close();
  }
}

cleanupIndexes();