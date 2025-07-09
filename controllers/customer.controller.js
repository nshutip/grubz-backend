const { User, Order, OrderItem, Vendor, Community } = require('../models');

exports.getAllCustomers = async (req, res) => {
    try {
      let customers;
  
      if (req.user.role === 'platform_admin') {
        // Platform admin can see all customers
        customers = await User.findAll({
            where: { role: 'customer' },
            include: [{ model: Community, attributes: ['id', 'slug'] }]
        });
      } else {
        return res.status(403).json({ error: 'Access denied — you are not a platform admin' });
      }
  
      res.json(customers);
    } catch (err) {
      console.error('Error fetching customers:', err);
      res.status(500).json({ error: 'Failed to fetch customers' + err });
    }
};

exports.getCustomerById = async (req, res) => {
    try {
      const customer = await User.findByPk(req.params.id, {
        where: { role: 'customer' },
        include: [
          { model: Community, attributes: ['id', 'slug'] }
        ]
      });
  
      if (!customer) return res.status(404).json({ error: 'Customer not found' });

      // Check scope based on role
      if (
        req.user.role !== 'platform_admin' && req.user.role !== 'community_admin'
      ) {
        return res.status(403).json({ error: 'Access denied: You are not a platform admin' });
      } else if (req.user.role == 'community_admin' && req.user.communityId !== customer.communityId) {
        return res.status(403).json({ error: 'Access denied: Customer does not belong to your community' });
      }
  
      res.json(customer);
    } catch (err) {
      console.error('Error fetching customer:', err);
      res.status(500).json({ error: 'Failed to fetch customer' });
    }
};

exports.getProfile = async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: ['id', 'name', 'email', 'phone', 'role', 'communityId']
  });
  res.json(user);
};

exports.updateProfile = async (req, res) => {
  const { name, phone } = req.body;
  await User.update({ name, phone }, { where: { id: req.user.id } });
  res.json({ message: 'Profile updated successfully' });
};

exports.getOrders = async (req, res) => {
  const orders = await Order.findAll({
    where: { customerId: req.user.id },
    include: [
      { model: Vendor },
      { model: OrderItem }
    ],
    order: [['createdAt', 'DESC']]
  });
  res.json(orders);
};
