const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendController');
const auth = require('../middleware/auth');

router.post('/request', auth, (req, res, next) => friendController.sendRequest(req, res).catch(next));
router.get('/requests', auth, (req, res, next) => friendController.getRequests(req, res).catch(next));
router.put('/request/:fromId', auth, (req, res, next) => friendController.handleRequest(req, res).catch(next));
router.get('/', auth, (req, res, next) => friendController.getFriends(req, res).catch(next));
router.get('/sent', auth, (req, res, next) => friendController.getSentRequests(req, res).catch(next));
router.delete('/:friendId', auth, (req, res, next) => friendController.removeFriend(req, res).catch(next));

module.exports = router;
