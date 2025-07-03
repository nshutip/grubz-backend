const { Vendor, MenuItem } = require('../models');

exports.getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.findAll();
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
};

exports.getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findByPk(req.params.id);
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
    res.json(vendor);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching vendor' });
  }
};

exports.getVendorMenu = async (req, res) => {
  try {
    const menu = await MenuItem.findAll({
      where: { vendorId: req.params.id }
    });
    res.json(menu);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching menu' });
  }
};
