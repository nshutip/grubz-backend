const { Vendor, MenuItem, Order, OrderItem, User, Community } = require('../models');
const { Op } = require('sequelize');
const Sequelize = require('sequelize');

exports.getAllVendors = async (req, res) => {
    try {
      let vendors;
  
      if (req.user.role === 'platform_admin') {
        // Platform admin can see all vendors
        vendors = await Vendor.findAll({
          include: [{ model: User, attributes: ['id', 'name', 'email'] }, { model: Community, attributes: ['id', 'slug'] }]
        });
      } else if (req.user.communityId) {
        // Others (customer, vendor, community_admin) can only see vendors in their community
        vendors = await Vendor.findAll({
          where: { communityId: req.user.communityId },
          include: [{ model: User, attributes: ['id', 'name', 'email'] }, { model: Community, attributes: ['id', 'slug'] }]
        });
      } else {
        return res.status(403).json({ error: 'Access denied — community not found' });
      }
  
      res.json(vendors);
    } catch (err) {
      console.error('Error fetching vendors:', err);
      res.status(500).json({ error: 'Failed to fetch vendors' });
    }
};

exports.getVendorById = async (req, res) => {
    try {
      const vendor = await Vendor.findByPk(req.params.id, {
        include: [
          { model: User, attributes: ['id', 'name', 'email'] },
          { model: Community, attributes: ['id', 'slug'] }
        ]
      });
  
      if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
  
      // Check scope based on role
      if (
        req.user.role !== 'platform_admin' &&
        req.user.communityId !== vendor.communityId
      ) {
        return res.status(403).json({ error: 'Access denied: not your community' });
      }
  
      res.json(vendor);
    } catch (err) {
      console.error('Error fetching vendor:', err);
      res.status(500).json({ error: 'Failed to fetch vendor' });
    }
};

exports.getVendorProfile = async (req, res) => {
  const vendor = await Vendor.findOne({
    where: { userId: req.user.id },
    include: [MenuItem]
  });
  if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
  res.json(vendor);
};

exports.updateVendorProfile = async (req, res) => {
  const { name, description } = req.body;
  const vendor = await Vendor.findOne({ where: { userId: req.user.id } });
  if (!vendor) return res.status(404).json({ error: 'Vendor not found' });

  await Vendor.update({ name, description }, { where: { id: vendor.id } });
  res.json({ message: 'Vendor profile updated' });
};
  
exports.getVendorOrders = async (req, res) => {
  const vendor = await Vendor.findOne({ where: { userId: req.user.id } });
  if (!vendor) return res.status(404).json({ error: 'Vendor not found' });

  const orders = await Order.findAll({
    where: { vendorId: vendor.id },
    include: [
      { model: OrderItem },
      { model: User, as: 'customer', attributes: ['id', 'name', 'email'] }
    ],
    order: [['createdAt', 'DESC']]
  });

  res.json(orders);
};

exports.getVendorMenu = async (req, res) => {
    try {
      const vendor = await Vendor.findByPk(req.params.id);
      if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
  
      // Restrict by community (optional)
      if (
        req.user.role !== 'platform_admin' &&
        req.user.communityId !== vendor.communityId
      ) {
        return res.status(403).json({ error: "You cannot access this vendor's menu" });
      }
  
      const menu = await MenuItem.findAll({ where: { vendorId: vendor.id } });
      res.json(menu);
    } catch (err) {
      res.status(500).json({ error: 'Error fetching menu' + err });
    }
};


// ✅ View public menu (by community)
exports.getPublicMenu = async (req, res) => {
  try {
    const vendor = await Vendor.findByPk(req.params.id);
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });

    if (
      req.user.role !== 'platform_admin' &&
      vendor.communityId !== req.user.communityId
    ) {
      return res.status(403).json({ error: 'Access denied — not your community' });
    }

    const menu = await MenuItem.findAll({ where: { vendorId: vendor.id } });
    res.json(menu);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load menu' + err });
  }
};

// ✅ View your own menu
exports.getMyMenu = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ where: { userId: req.user.id } });
    if (!vendor) return res.status(404).json({ error: 'Vendor profile not found' });

    const menu = await MenuItem.findAll({ where: { vendorId: vendor.id } });
    res.json(menu);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load menu' + err });
  }
};

// ✅ Add menu item
exports.addMenuItem = async (req, res) => {
  try {
    const { name, description, price, imageUrl } = req.body;
    const vendor = await Vendor.findOne({ where: { userId: req.user.id } });

    if (!vendor) return res.status(404).json({ error: 'Vendor profile not found' });

    const existingItem = await MenuItem.findOne({
      where: {
        vendorId: vendor.id,
        [Op.and]: [
          Sequelize.where(
            Sequelize.fn('LOWER', Sequelize.col('name')),
            name.toLowerCase()
          )
        ]
      }
    });
    if (existingItem) {
      return res.status(400).json({ error: 'A menu item with this name already exists.' });
    }

    const item = await MenuItem.create({
      name,
      description,
      price,
      imageUrl,
      vendorId: vendor.id
    });

    res.status(201).json(item);
  } catch (err) {
    console.error('Add menu item error:', err);
    res.status(500).json({ error: 'Failed to create menu item' + err });
  }
};

// ✅ Update menu item (ownership enforced)
exports.updateMenuItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const item = await MenuItem.findByPk(itemId);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const vendor = await Vendor.findOne({ where: { userId: req.user.id } });
    if (!vendor || item.vendorId !== vendor.id) {
      return res.status(403).json({ error: 'Access denied — not your item' });
    }

    await item.update(req.body);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update menu item' });
  }
};

// ✅ Delete menu item (ownership enforced)
exports.deleteMenuItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const item = await MenuItem.findByPk(itemId);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const vendor = await Vendor.findOne({ where: { userId: req.user.id } });
    if (!vendor || item.vendorId !== vendor.id) {
      return res.status(403).json({ error: 'Access denied — not your item' });
    }

    await item.destroy();
    res.json({ message: 'Menu item deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
};
