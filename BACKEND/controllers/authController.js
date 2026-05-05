const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const SECRET = 'cinexus_secret_key';

exports.register = (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });

    const users = User.read();
    if (users.find(u => u.email === email)) return res.status(400).json({ error: 'Email already exists' });

    const newUser = { id: users.length + 1, name, email, password, bio: '' };
    users.push(newUser);
    User.write(users);

    res.json({ message: 'User registered' });
};

exports.login = (req, res) => {
    const { email, password } = req.body;
    const users = User.read();
    const user = users.find(u => u.email === email);
    if (!user || user.password !== password) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, bio: user.bio } });
};
