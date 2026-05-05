const express = require('express');
const router = express.Router();
const movieListController = require('../controllers/movieListController');
const auth = require('../middleware/auth');

router.get('/me', auth, (req, res, next) => movieListController.getMyLists(req, res).catch(next));
router.get('/:id', (req, res, next) => movieListController.getListById(req, res).catch(next));
router.post('/', auth, (req, res, next) => movieListController.createList(req, res).catch(next));
router.put('/:id', auth, (req, res, next) => movieListController.updateList(req, res).catch(next));
router.delete('/:id', auth, (req, res, next) => movieListController.deleteList(req, res).catch(next));

module.exports = router;
