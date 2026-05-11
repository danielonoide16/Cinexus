const MovieList = require('../models/movieListModel');

exports.createList = async (req, res) => {
    const { name, description, movies } = req.body;
    if (!name) return res.status(400).json({ error: 'List name is required' });

    const list = await MovieList.create({
        owner: req.user.id,
        name: name.trim(),
        description: description || '',
        movies: movies || []
    });

    res.status(201).json(list);
};

exports.getMyLists = async (req, res) => {
    const lists = await MovieList.find({ owner: req.user.id }).populate('movies');
    res.json(lists);
};

exports.getListById = async (req, res) => {
    const list = await MovieList.findById(req.params.id).populate('owner', 'name avatarUrl').populate('movies');
    if (!list) return res.status(404).json({ error: 'List not found' });

    res.json(list);
};

exports.updateList = async (req, res) => {
    const { name, description, movies } = req.body;
    const list = await MovieList.findOne({ _id: req.params.id, owner: req.user.id });
    if (!list) return res.status(404).json({ error: 'List not found' });

    if (name !== undefined) list.name = name.trim();
    if (description !== undefined) list.description = description;
    if (movies !== undefined) list.movies = movies;

    await list.save();
    const updatedList = await MovieList.findById(list._id).populate('movies');
    res.json(updatedList);
};

exports.addMovieToList = async (req, res) => {
    const { tmdbID } = req.body;
    if (!tmdbID) return res.status(400).json({ error: 'tmdbID is required' });

    const list = await MovieList.findOne({ _id: req.params.id, owner: req.user.id });
    if (!list) return res.status(404).json({ error: 'List not found' });

    const Movie = require('../models/movieModel');
    let movie = await Movie.findOne({ tmdbID });
    if (!movie) {
        let movieController = require('./movieController');
        const details = await movieController.getMovieByTmdbId(tmdbID);
        if (!details || details.Response === 'False') return res.status(404).json({ error: 'Movie not found in OMDB' });
        movie = await Movie.create({ title: details.Title, year: Number(details.Year) || undefined, tmdbID, poster: details.Poster !== 'N/A' ? details.Poster : '', plot: details.Plot, genres: (details.Genre || '').split(',').map(g => g.trim()).filter(Boolean), rated: details.Rated, runtime: parseInt(details.Runtime) || undefined });
    }

    if (list.movies.includes(movie._id)) return res.status(409).json({ error: 'Movie already in list' });
    list.movies.push(movie._id);
    await list.save();
    const updated = await MovieList.findById(list._id).populate('movies');
    res.json(updated);
};

exports.removeMovieFromList = async (req, res) => {
    const list = await MovieList.findOne({ _id: req.params.id, owner: req.user.id });
    if (!list) return res.status(404).json({ error: 'List not found' });
    list.movies = list.movies.filter(m => m.toString() !== req.params.movieId);
    await list.save();
    const updated = await MovieList.findById(list._id).populate('movies');
    res.json(updated);
};

exports.deleteList = async (req, res) => {
    const list = await MovieList.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    if (!list) return res.status(404).json({ error: 'List not found' });
    res.json({ message: 'List deleted' });
};
