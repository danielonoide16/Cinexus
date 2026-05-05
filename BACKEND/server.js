const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const friendRoutes = require('./routes/friendRoutes');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'FRONTEND')));

app.get('/', (req, res) => {
    res.redirect('/views/login-register.html');
});

app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', friendRoutes);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
