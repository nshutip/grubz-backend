const { Order, OrderItem, MenuItem, Payment } = require('../models');

exports.createOrder = async (req, res) => {
  const { vendorId, items, method } = req.body;

  try {
    const menuItems = await MenuItem.findAll({ where: { id: items.map(i => i.menuItemId) } });

    let total = 0;
    const orderItems = items.map(item => {
      const matched = menuItems.find(m => m.id === item.menuItemId);
      const price = parseFloat(matched.price);
      total += price * item.quantity;
      return { menuItemId: item.menuItemId, quantity: item.quantity, price };
    });

    const order = await Order.create({
      customerId: req.user.id,
      vendorId,
      total_price: total,
      status: 'pending',
      payment_status: 'pending'
    });

    for (const item of orderItems) {
      await OrderItem.create({ ...item, orderId: order.id });
    }

    const payment = await Payment.create({
      orderId: order.id,
      amount: total,
      method,
      status: 'pending'
    });

    res.status(201).json({ order, payment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to place order' });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: ['OrderItems', 'Payment']
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};
