const Order = require('../models/Orders');
const Product = require('../models/Product');
const sequelize = require('../config/database');

/**
 * 自动取消超时订单定时任务
 * 每5分钟执行一次
 */

const ORDER_TIMEOUT = 30 * 60 * 1000; // 30分钟

async function cancelExpiredOrders() {
  const transaction = await sequelize.transaction();
  
  try {
    console.log('开始检查超时订单...');
    
    const now = new Date();
    
    // 查找所有过期的待支付订单
    const expiredOrders = await Order.findAll({
      where: {
        status: 'pending',
        expiresAt: {
          [sequelize.Op.lt]: now
        }
      },
      transaction
    });
    
    if (expiredOrders.length === 0) {
      console.log('没有超时订单需要处理');
      await transaction.commit();
      return;
    }
    
    console.log(`发现 ${expiredOrders.length} 个超时订单`);
    
    // 遍历取消订单并恢复库存
    for (const order of expiredOrders) {
      try {
        // 恢复库存（乐观锁）
        await Product.update(
          { stock: sequelize.literal(`stock + ${order.quantity}`) },
          {
            where: { id: order.productId },
            transaction
          }
        );
        
        // 更新订单状态
        await order.update({ status: 'cancelled' }, { transaction });
        
        console.log(`订单 ${order.id} 已取消，库存已恢复`);
      } catch (error) {
        console.error(`取消订单 ${order.id} 失败:`, error.message);
        // 继续处理下一个订单
      }
    }
    
    await transaction.commit();
    console.log('超时订单处理完成');
    
  } catch (error) {
    await transaction.rollback();
    console.error('处理超时订单失败:', error);
  }
}

// 执行任务
cancelExpiredOrders();

// 如果需要持续运行，可以使用 setInterval
// setInterval(cancelExpiredOrders, 5 * 60 * 1000); // 每5分钟执行一次

module.exports = cancelExpiredOrders;