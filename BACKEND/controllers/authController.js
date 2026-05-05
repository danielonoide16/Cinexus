const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const SECRET = process.env.JWT_SECRET || 'cinexus_secret_key';

exports.register = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        bio: '',
        avatarUrl: ''
    });

    res.status(201).json({
        message: 'User registered',
        user: {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            bio: newUser.bio,
            avatarUrl: newUser.avatarUrl
        }
    });
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
        { id: user._id.toString(), name: user.name, email: user.email },
        SECRET,
        { expiresIn: '24h' }
    );

    res.json({
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            bio: user.bio,
            avatarUrl: user.avatarUrl
        }
    });
};
