const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/auth');

router.get('/movie/:movieId', (req, res, next) => reviewController.getMovieReviews(req, res).catch(next));
router.get('/me', auth, (req, res, next) => reviewController.getMyReviews(req, res).catch(next));
router.post('/', auth, (req, res, next) => reviewController.createOrUpdateReview(req, res).catch(next));
router.delete('/:id', auth, (req, res, next) => reviewController.deleteReview(req, res).catch(next));

module.exports = router;
