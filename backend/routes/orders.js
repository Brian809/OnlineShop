const express = require('express');
const router = express.Router();
const Order = require('../models/Orders');
const Product = require('../models/Product');
const passport = require('passport');

router.post('/create', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { userId, productId, quantity, totalPrice } = req.body;
    const order = await Order.create({
      userId,
      productId,
      quantity,
      totalPrice,
      status: 'pending'
    });
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/user/:userId', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user.id !== parseInt(userId)) {
        return res.status(403).json({ error: 'Forbidden' });
        
    }
    const orders = await Order.findAll({
      where: { userId },
      include: [{ model: Product, as: 'Product' }]
    });
    res.status(200).json(orders);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;