const { Order, OrderItem, Vendor, MenuItem, Payment, User } = require('../models');

// ✅ Helper: Get vendor by ID and ensure community match
const getVendorIfInUserCommunity = async (vendorId, userCommunityId) => {
  const vendor = await Vendor.findByPk(vendorId);
  if (!vendor) return null;
  return vendor.communityId === userCommunityId ? vendor : null;
};

// ✅ Place an order (customer-only)
exports.placeOrder = async (req, res) => {
  const { vendorId, items, method = 'mobile_money' } = req.body;
  const customer = req.user;

  try {
    // 🔐 Enforce single-vendor and same-community rule
    const vendor = await getVendorIfInUserCommunity(vendorId, customer.communityId);
    if (!vendor) return res.status(403).json({ error: 'Vendor not in your community' });

    // 🔍 Fetch all menu items in the request
    const menuItemIds = items.map(item => item.menuItemId);
    const menuItems = await MenuItem.findAll({ where: { id: menuItemIds, vendorId } });

    // ❌ Fail if any menu item doesn't exist or doesn't belong to vendor
    if (menuItems.length !== items.length) {
      return res.status(400).json({ error: 'One or more menu items are invalid or unavailable' });
    }

    // 💰 Calculate total & prepare order items
    let total = 0;
    const orderItems = items.map(item => {
      const matchedItem = menuItems.find(mi => mi.id === item.menuItemId);
      const price = parseFloat(matchedItem.price);
      total += price * item.quantity;
      return {
        menuItemId: matchedItem.id,
        quantity: item.quantity,
        price
      };
    });

    // 🛒 Create order and order items
    const order = await Order.create({
      customerId: customer.id,
      vendorId,
      total_price: total,
      status: 'pending',
      payment_status: 'pending'
    });

    await Promise.all(
      orderItems.map(item =>
        OrderItem.create({ ...item, orderId: order.id })
      )
    );

    const payment = await Payment.create({
      orderId: order.id,
      amount: total,
      method,
      status: 'pending'
    });

    res.status(201).json({ order, items: orderItems, payment });
  } catch (err) {
    console.error('Place order error:', err);
    res.status(500).json({ error: 'Failed to place order' + err });
  }
};

// ✅ Get a user's own order
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { customerId: req.user.id },
      include: [OrderItem, Vendor]
    });

    res.json(orders);
  } catch (err) {
    console.error('Get my orders error:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// ✅ Scoped order view (customer or vendor who owns it)
exports.getOrderById = async (req, res) => {
  const orderId = req.params.id;
  const user = req.user;

  try {
    const order = await Order.findByPk(orderId, {
      include: [
        { model: OrderItem },
        { model: Vendor },
        { model: User, as: 'customer', attributes: ['id', 'name', 'email'] }
      ]
    });

    if (!order) return res.status(404).json({ error: 'Order not found' });

    const isCustomer = user.role === 'customer' && order.customerId === user.id;

    let isVendor = false;
    if (user.role === 'vendor') {
      const vendor = await Vendor.findOne({ where: { userId: user.id } });
      isVendor = vendor && vendor.id === order.vendorId;
    }

    if (!isCustomer && !isVendor) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(order);
  } catch (err) {
    console.error('Get order by ID error:', err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};
