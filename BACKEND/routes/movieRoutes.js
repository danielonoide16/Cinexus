const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const auth = require('../middleware/auth');

router.get('/recent', (req, res, next) => movieController.getRecentMovies(req, res).catch(next));
router.get('/search', (req, res, next) => movieController.searchMovies(req, res).catch(next));
router.get('/years', (req, res, next) => movieController.getMovieYears(req, res).catch(next));
router.get('/genres', (req, res, next) => movieController.getGenres(req, res).catch(next));
router.get('/', (req, res, next) => movieController.getMovies(req, res).catch(next));
router.get('/tmdb/:tmdbID', (req, res, next) => movieController.getMovieByTmdbId(req, res).catch(next));
router.get('/:id', (req, res, next) => movieController.getMovieById(req, res).catch(next));
router.post('/', auth, (req, res, next) => movieController.createMovie(req, res).catch(next));

module.exports = router;
