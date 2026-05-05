const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendController');
const auth = require('../middleware/auth');

router.post('/friends/request', auth, friendController.sendRequest);
router.get('/friends/requests', auth, friendController.getRequests);
router.put('/friends/request/:fromId', auth, friendController.handleRequest);
router.get('/friends', auth, friendController.getFriends);
router.get('/friends/sent', auth, friendController.getSentRequests);

module.exports = router;
