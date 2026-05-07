const User = require('../models/userModel');
const Review = require('../models/reviewModel');
const MovieList = require('../models/movieListModel');
const FriendRequest = require('../models/friendModel');

exports.getProfile = async (req, res) => {
    const user = await User.findById(req.user.id).select('-password').populate('friends', 'name email bio avatarUrl');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
};

exports.updateProfile = async (req, res) => {
    const { name, email, bio, avatarUrl } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (email && email.toLowerCase().trim() !== user.email) {
        const emailInUse = await User.findOne({ email: email.toLowerCase().trim(), _id: { $ne: user._id } });
        if (emailInUse) {
            return res.status(400).json({ error: 'Email already exists' });
        }
    }

    if (name) user.name = name.trim();
    if (email) user.email = email.toLowerCase().trim();
    if (bio !== undefined) user.bio = bio;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

    await user.save();

    res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        avatarUrl: user.avatarUrl
    });
};

exports.searchUsers = async (req, res) => {
    const query = (req.query.q || '').toLowerCase();

    const results = await User.find({
        _id: { $ne: req.user.id },
        name: { $regex: query, $options: 'i' }
    }).select('name bio avatarUrl');

    res.json(
        results.map(user => ({
            id: user._id.toString(),
            name: user.name,
            bio: user.bio,
            avatarUrl: user.avatarUrl
        }))
    );
};

exports.uploadAvatar = async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.avatarUrl = '/uploads/' + req.file.filename;
    await user.save();

    res.json({ avatarUrl: user.avatarUrl });
};

exports.deleteAccount = async (req, res) => {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await Promise.all([
        Review.deleteMany({ user: userId }),
        MovieList.deleteMany({ owner: userId }),
        FriendRequest.deleteMany({
            $or: [
                { from: userId },
                { to: userId }
            ]
        }),
        User.updateMany(
            { friends: userId },
            { $pull: { friends: userId } }
        ),
        User.deleteOne({ _id: userId })
    ]);

    res.json({ message: 'Account deleted successfully' });
};

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('name email bio avatarUrl friends')
            .populate('friends', 'name bio avatarUrl');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);

    } catch (error) {
        res.status(500).json({ error: 'Error loading user profile' });
    }
};


exports.getPublicProfile = async (req, res) => {
    const { userId } = req.params;

    const user = await User.findById(userId)
        .select('name email bio avatarUrl friends')
        .populate('friends', 'name bio avatarUrl');

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const reviews = await Review.find({ user: userId })
        .populate('movie')
        .sort({ createdAt: -1 });

    const movieLists = await MovieList.find({ owner: userId })
        .populate('movies');

    res.json({
        user,
        reviews,
        lists: movieLists
    });
};