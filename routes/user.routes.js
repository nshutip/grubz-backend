const express = require('express');
const router = express.Router();
const { User } = require('../models');

router.get('/', async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

router.post('/', async (req, res) => {
  const { name, email, password_hash, role, communityId } = req.body;
  const user = await User.create({ name, email, password_hash, role, communityId });
  res.status(201).json(user);
});

module.exports = router;
