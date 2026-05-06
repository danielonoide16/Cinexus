const mongoose = require('mongoose');

const connectDB = async () => {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
        throw new Error('MONGODB_URI is not defined. Add it to your .env file.');
    }

    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');
};

module.exports = connectDB;
