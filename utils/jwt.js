const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET || 'supersecret';

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      communityId: user.communityId
    },
    secret,
    { expiresIn: '24h' }
  );
};

const verifyToken = (token) => {
  return jwt.verify(token, secret);
};

module.exports = { generateToken, verifyToken };
