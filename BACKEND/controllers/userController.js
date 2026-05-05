const User = require('../models/userModel');

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
