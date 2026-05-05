const Review = require('../models/reviewModel');
const Movie = require('../models/movieModel');

exports.createOrUpdateReview = async (req, res) => {
    const { movieId, rating, comment } = req.body;
    if (!movieId || !rating || !comment) {
        return res.status(400).json({ error: 'movieId, rating and comment are required' });
    }

    const movieExists = await Movie.exists({ _id: movieId });
    if (!movieExists) return res.status(404).json({ error: 'Movie not found' });

    const review = await Review.findOneAndUpdate(
        { user: req.user.id, movie: movieId },
        { rating, comment: comment.trim() },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate('user', 'name avatarUrl');

    res.status(201).json(review);
};

exports.getMovieReviews = async (req, res) => {
    const reviews = await Review.find({ movie: req.params.movieId })
        .populate('user', 'name avatarUrl')
        .sort({ createdAt: -1 });

    res.json(reviews);
};

exports.getMyReviews = async (req, res) => {
    const reviews = await Review.find({ user: req.user.id })
        .populate('movie')
        .sort({ createdAt: -1 });

    res.json(reviews);
};

exports.deleteReview = async (req, res) => {
    const review = await Review.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!review) return res.status(404).json({ error: 'Review not found' });
    res.json({ message: 'Review deleted' });
};
