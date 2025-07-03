const jwt = require('jsonwebtoken');
const { User } = require('../models');
const secret = process.env.JWT_SECRET || 'supersecret';

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader)
    return res.status(401).json({ message: 'Authorization header missing' });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, secret);
    const user = await User.findByPk(decoded.id);

    if (!user) return res.status(401).json({ message: 'Invalid user' });

    req.user = {
      id: user.id,
      role: user.role,
      communityId: user.communityId
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authenticate;
