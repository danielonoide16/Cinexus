const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

router.get('/me', auth, (req, res, next) => userController.getProfile(req, res).catch(next));
router.put('/me', auth, (req, res, next) => userController.updateProfile(req, res).catch(next));
router.get('/search', auth, (req, res, next) => userController.searchUsers(req, res).catch(next));

module.exports = router;
