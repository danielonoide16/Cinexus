const Movie = require('../models/movieModel');
const omdbService = require('../services/omdbService');
const tmdbService = require('../services/tmdbService');
const youtubeService = require('../services/youtubeService');


const toNumber = (value) => {
    if (!value || value === 'N/A') return undefined;
    const normalized = String(value).replace(/[^0-9.]/g, '');
    const parsed = Number(normalized);
    return Number.isNaN(parsed) ? undefined : parsed;
};

const splitList = (value) => {
    if (!value || value === 'N/A') return [];
    return String(value)
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);
};

const parseReleaseDate = (value) => {
    if (!value || value === 'N/A') return undefined;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};


const normalizeMovie = (movie) => {

    return {
        tmdbID: movie.id,

        title: movie.title,

        year: movie.release_date
            ? Number(movie.release_date.split('-')[0])
            : null,

        released: movie.release_date
            ? new Date(movie.release_date)
            : null,

        poster: movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : null,

        plot: movie.overview,

        imdbRating: movie.vote_average,

        genres: movie.genre_ids || []
    };
};


const isValidPoster = (url) => {
    return url &&
           url !== 'N/A' &&
           typeof url === 'string' &&
           url.startsWith('http') &&
           url.includes('.jpg');
};

const fixPoster = (url) => {
    if (!isValidPoster(url)) return null;

    return url.replace('SX300', 'SX500');
};

exports.getRecentMovies = async (req, res) => {

    try {

        const page = Number(req.query.page) || 1;

        const data = await tmdbService.getRecentMovies(page);

        const movies = data.results.map(movie => ({
            title: movie.title,
            year: movie.release_date
                ? Number(movie.release_date.split('-')[0])
                : null,

            poster: movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : null,

            tmdbID: movie.id,
            plot: movie.overview,
            rating: movie.vote_average
        }));

        res.json({
            items: movies,
            pagination: {
                page: data.page,
                totalPages: data.total_pages,
                total: data.total_results,
                hasNext: data.page < data.total_pages,
                hasPrev: data.page > 1
            }
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: 'Error loading TMDB movies'
        });
    }
};


exports.getMovieByTmdbId = async (req, res) => {

    const tmdbID = Number(req.params.tmdbID);

    let movie = await Movie.findOne({ tmdbID });

    if (!movie) {

        const details =
            await tmdbService.getMovieDetails(tmdbID);

        movie = await Movie.create({

            tmdbID: details.id,

            title: details.title,

            year: details.release_date
                ? Number(details.release_date.split('-')[0])
                : null,

            released: details.release_date
                ? new Date(details.release_date)
                : null,

            runtime: details.runtime,

            genres:
                details.genres.map(g => g.name),

            plot: details.overview,

            poster: details.poster_path
                ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
                : null,

            imdbRating: details.vote_average,

            countries:
                details.production_countries
                    .map(c => c.name),

            languages:
                details.spoken_languages
                    .map(l => l.english_name),

            type: 'movie'
        });
    }

    const trailer =
        await youtubeService.searchTrailer({
            title: movie.title,
            year: movie.year
        });

    const payload = movie.toObject();

    payload.trailer = trailer;

    res.json(payload);
};

exports.getMovies = async (req, res) => {

    const query = (req.query.q || '').trim();

    const genre = (req.query.genre || '').trim();

    const year = Number(req.query.year);

    const page = Math.max(
        1,
        Number(req.query.page) || 1
    );

    const sort = (req.query.sort || 'popularity.desc').trim();

    let data;

    if (query) {

        data = await tmdbService.searchMovies({
            query,
            page,
            year
        });

    } else {

        data = await tmdbService.discoverMovies({
            page,
            genre,
            year,
            sort
        });
    }

    let movies = data.results.map(normalizeMovie);
    if (year) {

        movies = movies.filter(movie =>
            movie.year === year
        );
    }

    if (genre) {

        movies = movies.filter(movie =>
            movie.genres.includes(Number(genre))
        );
    }

    res.json({
        items: movies,

        pagination: {

            page: data.page,

            totalPages: Math.min(
                data.total_pages,
                500
            ),

            total: data.total_results,

            hasNext:
                data.page < data.total_pages,

            hasPrev:
                data.page > 1
        }
    });
};

exports.getGenres = async (req, res) => {

    const genres =
        await tmdbService.getGenres();

    res.json(genres);
};

exports.getMovieYears = async (req, res) => {

    const currentYear =
        new Date().getFullYear();

    const years = [];

    for (let y = currentYear; y >= 1950; y--) {
        years.push(y);
    }

    res.json(years);
};

exports.searchMovies = async (req, res) => exports.getMovies(req, res);

exports.getMovieById = async (req, res) => {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ error: 'Movie not found' });
    res.json(movie);
};


