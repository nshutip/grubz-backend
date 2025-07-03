const { Community } = require('../models');

exports.getAllCommunities = async (req, res) => {
  try {
    const communities = await Community.findAll();
    res.json(communities);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load communities' });
  }
};
