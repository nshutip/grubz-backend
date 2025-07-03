const express = require('express');
const router = express.Router();
const { User } = require('../models');
const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/jwt');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, role, communityId } = req.body;

  try {
    const user = await User.create({
      name,
      email,
      password_hash: password,
      role,
      communityId
    });

    const token = generateToken(user);
    res.status(201).json({ user: { id: user.id, name: user.name, role: user.role }, token });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const isValid = await user.validPassword(password);
  if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });

  const token = generateToken(user);
  res.json({ user: { id: user.id, name: user.name, role: user.role }, token });
});

module.exports = router;
