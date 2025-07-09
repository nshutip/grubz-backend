const { Vendor, User, Order } = require('../models');


exports.getVendorsInCommunity = async (req, res) => {
  try {
    const vendors = await Vendor.findAll({
      where: { communityId: req.user.communityId },
      include: [{ model: User, attributes: ['id', 'name', 'email'] }]
    });
    res.json(vendors);
  } catch (err) {
    console.error('Error fetching community vendors:', err);
    res.status(500).json({ error: 'Failed to fetch vendors' + err});
  }
};

// exports.createVendor = async (req, res) => {
//     const { name, email, password_hash, role, communityId } = req.body;

//     try {
//         const user = await User.create({ name, email, password_hash, role, communityId });
//         res.status(201).json(user);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: 'Failed to create vendor' });
//     }
// };


exports.approveVendor = async (req, res) => {
  const { vendorId } = req.params;
  const { isApproved } = req.body;

  try {
    const vendor = await Vendor.findByPk(vendorId, {
      include: [{ model: User }]
    });

    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
    if (vendor.communityId !== req.user.communityId) {
      return res.status(403).json({ error: 'Unauthorized: Vendor not in your community' });
    }

    if (vendor.is_approved === isApproved) {
      return res.status(400).json({ error: 'Vendor is already ' + (isApproved ? 'approved' : 'rejected') });
    }

    await vendor.update({ is_approved: isApproved });

    res.json({ message: ` ${vendor.name} has been ${isApproved ? 'approved' : 'rejected'}` });
  } catch (err) {
    console.error('Error updating vendor approval:', err);
    res.status(500).json({ error: 'Failed to update vendor approval' });
  }
};



exports.getCommunityStats = async (req, res) => {
  try {
    const communityId = req.user.communityId;

    const userCount = await User.count({ where: { communityId } });
    const communityAdminCount = await User.count({ where: { communityId, role: 'community_admin' } });
    const customerCount = await User.count({ where: { communityId, role: 'customer' } });
    const vendorCount = await Vendor.count({ where: { communityId } });
    const orderCount = await Order.count({
      include: {
        model: Vendor,
        where: { communityId }
      }
    });

    res.json({
        users: userCount,
        community_admins: communityAdminCount,
        vendors: vendorCount,
        customers: customerCount,
        orders: orderCount
    });
  } catch (err) {
    console.error('Error fetching community stats:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};
