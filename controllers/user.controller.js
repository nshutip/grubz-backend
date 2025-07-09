const { User, Vendor, Community } = require('../models');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch users' + err });
    }
};

exports.createUser = async (req, res) => {
    const { name, email, password_hash, role, communityId } = req.body;
  
    try {
        // Basic validation for required fields
        if (!name || !email || !password_hash || !role) {
            return res.status(400).json({ 
                error: 'Missing required fields: name, email, password_hash, and role are required' 
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                error: 'Invalid email format' 
            });
        }

        // Validate role
        const validRoles = ['customer', 'vendor', 'community_admin', 'platform_admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ 
                error: 'Invalid role. Must be one of: customer, vendor, community_admin, platform_admin' 
            });
        }

        // Validate password strength (minimum 6 characters)
        if (password_hash.length < 6) {
            return res.status(400).json({ 
                error: 'Password must be at least 6 characters long' 
            });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ 
                error: 'Email already exists' 
            });
        }

        // Validate community exists if communityId is provided
        if (communityId) {
            const community = await Community.findByPk(communityId);
            if (!community) {
                return res.status(400).json({ 
                    error: 'Invalid communityId: community does not exist' 
                });
            }
        }

        // Validate that community_admin and vendor roles require communityId
        if ((role === 'community_admin' || role === 'vendor') && !communityId) {
            return res.status(400).json({ 
                error: `Role '${role}' requires a communityId` 
            });
        }

        const user = await User.create({ name, email, password_hash, role, communityId });
        if (role === 'vendor') {
            await Vendor.create({
              userId: user.id,
              communityId: user.communityId
            });
        }
        res.status(201).json(user);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create user' });
    }
  };