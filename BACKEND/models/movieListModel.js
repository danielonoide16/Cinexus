const mongoose = require('mongoose');

const movieListSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            default: ''
        },
        movies: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Movie'
            }
        ]
    },
    {
        timestamps: true
    }
);

movieListSchema.index({ owner: 1, name: 1 });

module.exports = mongoose.model('MovieList', movieListSchema);
