/**
 * 数据库迁移脚本
 *
 * 功能：
 * - 同步数据库模型到数据库结构
 * - 支持安全模式（仅创建新表，不修改现有表）
 * - 支持强制模式（创建和修改表结构）
 * - 迁移后自动清理重复索引
 *
 * 使用方法：
 *   node migrate.js              # 安全模式（默认）
 *   node migrate.js --force      # 强制模式（会修改现有表结构）
 *   node migrate.js --no-cleanup # 不执行索引清理
 *
 * 注意：
 * - 生产环境默认禁用强制模式，需手动设置 FORCE_MIGRATE=true
 * - 建议在迁移前备份数据库
 */

// 加载环境变量（必须在其他模块导入之前）
require('dotenv').config();

const sequelize = require('../config/database');
const { User, Product, Cart } = require('../models');

// 解析命令行参数
const args = process.argv.slice(2);
const isForce = args.includes('--force');
const skipCleanup = args.includes('--no-cleanup');

/**
 * 清理重复索引
 */
async function cleanupIndexes() {
  try {
    console.log('\n--- 清理重复索引 ---');

    // 从模型中动态获取表名，避免硬编码
    const models = [User, Product, Cart];

    for (const model of models) {
      const tableName = model.tableName;
      console.log(`\n检查 ${tableName} 表的索引...`);

      const [indexes] = await sequelize.query(`SHOW INDEX FROM ${tableName}`);

      // 按列名分组索引
      const indexGroups = {};
      indexes.forEach(idx => {
        if (!indexGroups[idx.Column_name]) {
          indexGroups[idx.Column_name] = [];
        }
        indexGroups[idx.Column_name].push(idx);
      });

      // 查找并删除重复索引
      for (const [columnName, idxList] of Object.entries(indexGroups)) {
        if (idxList.length > 1) {
          console.log(`  发现 ${idxList.length} 个 ${columnName} 索引`);

          // 保留第一个（通常是 PRIMARY 或 UNIQUE），删除其他的
          for (let i = 1; i < idxList.length; i++) {
            const idx = idxList[i];
            // 跳过主键索引
            if (idx.Key_name !== 'PRIMARY') {
              console.log(`  删除索引: ${idx.Key_name}`);
              await sequelize.query(`ALTER TABLE ${tableName} DROP INDEX \`${idx.Key_name}\``);
            }
          }
        }
      }

      console.log(`  ${tableName} 表索引清理完成`);
    }

    console.log('\n✓ 索引清理完成');
  } catch (error) {
    console.error('✗ 索引清理失败:', error.message);
  }
}

/**
 * 执行数据库迁移
 */
async function migrate() {
  try {
    console.log('=== 数据库迁移脚本 ===\n');
    console.log(`环境: ${process.env.NODE_ENV || 'development'}`);
    console.log(`数据库: ${process.env.DB_NAME}`);
    console.log(`数据库地址: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    console.log(`模式: ${isForce ? '强制（修改表结构）' : '安全（仅创建新表）'}`);
    console.log(`索引清理: ${skipCleanup ? '跳过' : '执行'}`);

    // 验证数据库配置
    if (!process.env.DB_NAME || !process.env.DB_HOST || !process.env.DB_USER) {
      console.error('\n✗ 数据库配置不完整，请检查 .env 文件');
      console.error('必需配置项: DB_NAME, DB_HOST, DB_USER, DB_PASSWORD');
      process.exit(1);
    }

    // 生产环境安全检查
    if (process.env.NODE_ENV === 'production' && isForce) {
      if (!process.env.FORCE_MIGRATE) {
        console.error('\n✗ 生产环境禁止使用强制模式');
        console.error('如需强制迁移，请设置环境变量: FORCE_MIGRATE=true');
        process.exit(1);
      }
    }

    console.log('\n--- 开始同步数据库 ---');

    // 同步所有模型
    await sequelize.sync({
      alter: isForce,
      force: false // 永远不要强制删除表
    });

    console.log('✓ 数据库同步完成');

    // 执行索引清理
    if (!skipCleanup) {
      await cleanupIndexes();
    }

    console.log('\n=== 迁移成功完成 ===');

  } catch (error) {
    console.error('\n✗ 迁移失败:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// 运行迁移
migrate();