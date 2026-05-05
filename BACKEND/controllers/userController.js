const User = require('../models/userModel');

exports.getProfile = (req, res) => {
    const users = User.read();
    const user = users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, name: user.name, email: user.email, bio: user.bio });
};

exports.updateProfile = (req, res) => {
    const { name, email, bio } = req.body;
    const users = User.read();
    const idx = users.findIndex(u => u.id === req.user.id);
    if (idx === -1) return res.status(404).json({ error: 'User not found' });

    if (name) users[idx].name = name;
    if (email) users[idx].email = email;
    if (bio !== undefined) users[idx].bio = bio;
    User.write(users);

    res.json({ id: users[idx].id, name: users[idx].name, email: users[idx].email, bio: users[idx].bio });
};

exports.searchUsers = (req, res) => {
    const query = (req.query.q || '').toLowerCase();
    const users = User.read();
    const results = users
        .filter(u => u.id !== req.user.id && u.name.toLowerCase().includes(query))
        .map(u => ({ id: u.id, name: u.name, bio: u.bio }));
    res.json(results);
};
