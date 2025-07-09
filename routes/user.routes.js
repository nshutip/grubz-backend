const express = require('express');
const router = express.Router();
const { User } = require('../models');
const authenticate = require('../middleware/authMiddleware');
const userController = require('../controllers/user.controller');

// router.use(authenticate);

// router.get('/', authenticate, userController.getAllUsers);

router.get('/', userController.getAllUsers);

router.post('/', userController.createUser);

module.exports = router;
