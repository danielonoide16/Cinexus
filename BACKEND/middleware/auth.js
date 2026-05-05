const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'cinexus_secret_key';

module.exports = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    try {
        req.user = jwt.verify(token, SECRET);
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
};
