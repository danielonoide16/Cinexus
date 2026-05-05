const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

router.get('/user', auth, userController.getProfile);
router.put('/user', auth, userController.updateProfile);
router.get('/users/search', auth, userController.searchUsers);

module.exports = router;
