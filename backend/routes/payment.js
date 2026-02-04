const express = require('express');
const router = express.Router();
const { alipaySdk } = require('../config/alipay');
const Order = require('../models/Orders');
const Product = require('../models/Product');
const passport = require('passport');
const sequelize = require('../config/database');

/**
 * 创建支付订单
 * POST /api/payment/create
 */
router.post('/create', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { orderId, returnUrl } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: '订单ID不能为空' });
    }

    // 查询订单信息
    const order = await Order.findByPk(orderId, {
      include: [{ model: Product, as: 'Product' }]
    });

    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }

    // 检查订单状态
    if (order.status !== 'pending' && order.status !== 'paying') {
      return res.status(400).json({ message: '订单状态不正确，无法支付' });
    }

    // 检查订单是否过期
    if (new Date(order.expiresAt) < new Date()) {
      return res.status(400).json({ message: '订单已过期，请重新下单' });
    }

    // 更新订单状态为支付中
    await order.update({ status: 'paying' });

    // 构建支付宝支付参数
    const bizContent = {
      out_trade_no: order.id.toString(), // 商户订单号
      product_code: 'FAST_INSTANT_TRADE_PAY', // 产品码，电脑网站支付
      total_amount: parseFloat(order.totalPrice).toFixed(2), // 订单总金额
      subject: `订单支付-${order.Product.name}`, // 订单标题
      body: `订单编号: ${order.id}`, // 订单描述
      timeExpress: '30m', // 订单有效时间，30分钟
      notify_url: process.env.ALIPAY_NOTIFY_URL // 异步通知地址
    };

    // 生成支付链接（使用 pageExecute 方法）
    const payUrl = alipaySdk.pageExecute('alipay.trade.page.pay', 'GET', {
      bizContent: bizContent,
      returnUrl: returnUrl || process.env.ALIPAY_RETURN_URL
    });

    return res.json({
      message: '创建支付订单成功',
      payUrl: payUrl // 支付宝支付页面URL
    });
  } catch (error) {
    console.error('创建支付订单失败:', error);
    return res.status(500).json({ message: '创建支付订单失败', error: error.message });
  }
});

/**
 * 支付成功同步回调（页面跳转）
 * GET /api/payment/return
 */
router.get('/return', async (req, res) => {
  try {
    const { out_trade_no, trade_no, trade_status } = req.query;

    if (!out_trade_no) {
      return res.redirect('http://localhost:5173/orders?error=invalid_return');
    }

    // 查询订单
    const order = await Order.findByPk(out_trade_no);

    if (!order) {
      return res.redirect('http://localhost:5173/orders?error=order_not_found');
    }

    // 如果订单已经支付，直接跳转
    if (order.status === 'paid') {
      return res.redirect(`http://localhost:5173/orders?success=true&orderId=${order.id}`);
    }

    // 如果订单状态是 paying，主动查询支付宝支付状态
    if (order.status === 'paying') {
      try {
        const result = await alipaySdk.exec('alipay.trade.query', {
          bizContent: {
            out_trade_no: out_trade_no
          }
        });

        console.log('支付宝支付查询结果:', result);

        if (result.code === '10000') {
          const tradeStatus = result.tradeStatus;

          // 更新订单状态
          if (tradeStatus === 'TRADE_SUCCESS' || tradeStatus === 'TRADE_FINISHED') {
            await order.update({
              status: 'paid',
              alipayTradeNo: result.tradeNo,
              paidAt: new Date()
            });
            return res.redirect(`http://localhost:5173/orders?success=true&orderId=${order.id}`);
          }
        }
      } catch (error) {
        console.error('查询支付状态失败:', error);
      }

      // 查询失败或未支付，跳转到订单详情页继续轮询
      return res.redirect(`http://localhost:5173/orders?pending=true&orderId=${order.id}`);
    }

    return res.redirect('http://localhost:5173/orders?error=invalid_order_status');
  } catch (error) {
    console.error('支付同步回调失败:', error);
    return res.redirect('http://localhost:5173/orders?error=return_failed');
  }
});

/**
 * 支付成功异步通知（服务器回调）
 * POST /api/payment/notify
 */
router.post('/notify', async (req, res) => {
  try {
    // 验证签名
    const signVerified = alipaySdk.checkNotifySign(req.body);

    if (!signVerified) {
      console.error('支付宝通知签名验证失败');
      return res.send('failure');
    }

    const { out_trade_no, trade_no, trade_status, total_amount } = req.body;

    // 查询订单
    const order = await Order.findByPk(out_trade_no);

    if (!order) {
      console.error('订单不存在:', out_trade_no);
      return res.send('failure');
    }

    // 验证金额是否一致
    if (parseFloat(total_amount) !== parseFloat(order.totalPrice)) {
      console.error('支付金额不匹配:', total_amount, order.totalPrice);
      return res.send('failure');
    }

    // 处理支付成功
    if (trade_status === 'TRADE_SUCCESS' || trade_status === 'TRADE_FINISHED') {
      // 幂等性检查：如果订单已经是 paid 状态，直接返回成功
      if (order.status === 'paid') {
        return res.send('success');
      }

      // 更新订单状态
      await order.update({
        status: 'paid',
        alipayTradeNo: trade_no,
        paidAt: new Date()
      });

      console.log(`订单 ${order.id} 支付成功，交易号: ${trade_no}`);
      return res.send('success');
    }

    return res.send('failure');
  } catch (error) {
    console.error('支付异步通知失败:', error);
    return res.send('failure');
  }
});

/**
 * 查询支付状态
 * GET /api/payment/query/:orderId
 */
router.get('/query/:orderId', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const orderId = req.params.orderId;

    const order = await Order.findByPk(orderId);

    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }

    // 如果订单已经是 paid 状态，直接返回
    if (order.status === 'paid') {
      return res.json({
        status: 'paid',
        order: {
          id: order.id,
          status: order.status,
          alipayTradeNo: order.alipayTradeNo,
          paidAt: order.paidAt
        }
      });
    }

    // 如果订单不是 pending 或 paying 状态，直接返回
    if (order.status !== 'pending' && order.status !== 'paying') {
      return res.json({
        status: order.status,
        order: {
          id: order.id,
          status: order.status
        }
      });
    }

    // 调用支付宝查询接口查询支付状态
    const result = await alipaySdk.exec('alipay.trade.query', {
      bizContent: {
        out_trade_no: orderId.toString()
      }
    });

    console.log('支付宝查询结果:', result);

    if (result.code === '10000') {
      const tradeStatus = result.tradeStatus;

      // 更新订单状态
      if (tradeStatus === 'TRADE_SUCCESS' || tradeStatus === 'TRADE_FINISHED') {
        await order.update({
          status: 'paid',
          alipayTradeNo: result.tradeNo,
          paidAt: new Date()
        });
      } else if (tradeStatus === 'WAIT_BUYER_PAY') {
        await order.update({ status: 'paying' });
      } else if (tradeStatus === 'TRADE_CLOSED') {
        await order.update({ status: 'cancelled' });
        // 恢复库存
        await Product.update(
          { stock: sequelize.literal(`stock + ${order.quantity}`) },
          { where: { id: order.productId } }
        );
      }

      return res.json({
        status: tradeStatus,
        order: {
          id: order.id,
          status: order.status,
          alipayTradeNo: order.alipayTradeNo,
          paidAt: order.paidAt
        }
      });
    } else {
      // 查询失败，可能是订单还未在支付宝创建，返回当前订单状态
      console.error('支付宝查询失败:', result);
      return res.json({
        status: order.status,
        order: {
          id: order.id,
          status: order.status
        },
        message: '查询失败，返回当前订单状态'
      });
    }
  } catch (error) {
    console.error('查询支付状态失败:', error);
    return res.status(500).json({ message: '查询支付状态失败', error: error.message });
  }
});

/**
 * 申请退款
 * POST /api/payment/refund
 */
router.post('/refund', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { orderId, refundAmount } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: '订单ID不能为空' });
    }

    const order = await Order.findByPk(orderId);

    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }

    // 检查订单状态
    if (order.status !== 'paid') {
      return res.status(400).json({ message: '订单状态不正确，无法退款' });
    }

    // 调用支付宝退款接口
    const result = await alipaySdk.exec('alipay.trade.refund', {
      bizContent: {
        out_trade_no: order.id.toString(),
        refund_amount: refundAmount || parseFloat(order.totalPrice).toFixed(2),
        refund_reason: '用户申请退款'
      }
    });

    if (result.code === '10000') {
      // 更新订单状态为已退款
      await order.update({ status: 'refunded' });

      // 恢复库存
      await Product.update(
        { stock: sequelize.literal(`stock + ${order.quantity}`) },
        { where: { id: order.productId } }
      );

      return res.json({
        message: '退款成功',
        refundId: result.fundChangeList?.[0]?.fundChannel || result.outRequestNo
      });
    } else {
      return res.status(500).json({
        message: '退款失败',
        code: result.code,
        msg: result.msg
      });
    }
  } catch (error) {
    console.error('申请退款失败:', error);
    return res.status(500).json({ message: '申请退款失败', error: error.message });
  }
});

module.exports = router;