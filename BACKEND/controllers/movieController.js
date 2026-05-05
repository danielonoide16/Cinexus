const Movie = require('../models/movieModel');

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

exports.createMovie = async (req, res) => {
    const payload = req.body;

    const movieData = {
        title: payload.title || payload.Title,
        year: toNumber(payload.year || payload.Year),
        rated: payload.rated || payload.Rated,
        released: parseReleaseDate(payload.released || payload.Released),
        runtime: toNumber(payload.runtime || payload.Runtime),
        genres: splitList(payload.genres || payload.Genre),
        directors: splitList(payload.directors || payload.Director),
        writers: splitList(payload.writers || payload.Writer),
        actors: splitList(payload.actors || payload.Actors),
        plot: payload.plot || payload.Plot,
        languages: splitList(payload.languages || payload.Language),
        countries: splitList(payload.countries || payload.Country),
        awards: payload.awards || payload.Awards,
        poster: payload.poster || payload.Poster,
        ratings: (payload.ratings || payload.Ratings || []).map(rating => ({
            source: rating.source || rating.Source,
            value: rating.value || rating.Value
        })),
        metascore: toNumber(payload.metascore || payload.Metascore),
        imdbRating: toNumber(payload.imdbRating),
        imdbVotes: toNumber(payload.imdbVotes),
        imdbID: payload.imdbID,
        type: payload.type || payload.Type || 'movie',
        boxOffice: toNumber(payload.boxOffice || payload.BoxOffice)
    };

    if (!movieData.title) {
        return res.status(400).json({ error: 'Movie title is required' });
    }

    const filter = movieData.imdbID
        ? { imdbID: movieData.imdbID }
        : { title: movieData.title, year: movieData.year };

    const movie = await Movie.findOneAndUpdate(
        filter,
        movieData,
        {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true,
            runValidators: true
        }
    );

    res.status(201).json(movie);
};

exports.getMovies = async (req, res) => {
    const query = (req.query.q || '').trim();
    const filters = query ? { title: { $regex: query, $options: 'i' } } : {};
    const movies = await Movie.find(filters).sort({ createdAt: -1 });
    res.json(movies);
};

exports.getMovieById = async (req, res) => {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ error: 'Movie not found' });
    res.json(movie);
};

exports.getMovieByImdbId = async (req, res) => {
    const movie = await Movie.findOne({ imdbID: req.params.imdbID });
    if (!movie) return res.status(404).json({ error: 'Movie not found' });
    res.json(movie);
};
