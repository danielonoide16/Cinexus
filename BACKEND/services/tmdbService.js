const axios = require('axios');

const BASE_URL = 'https://api.themoviedb.org/3';

const API_KEY = process.env.TMDB_API_KEY;

const LANGUAGE = process.env.TMDB_LANGUAGE || 'en-US';

const client = axios.create({
    baseURL: BASE_URL,
    params: {
        api_key: API_KEY,
        language: LANGUAGE
    }
});

exports.getRecentMovies = async (page = 1) => {

    const response = await client.get('/movie/now_playing', {
        params: { page }
    });

    return response.data;
};

exports.searchMovies = async ({
    query,
    page = 1,
    year
}) => {

    const response = await client.get('/search/movie', {
        params: {
            query,
            page,
            year
        }
    });

    return response.data;
};

exports.discoverMovies = async ({
    page = 1,
    genre,
    year,
    sort = 'popularity.desc'
}) => {

    const params = {
        api_key: API_KEY,
        language: LANGUAGE,
        page,
        sort_by: sort
    };

    if (genre) {
        params.with_genres = genre;
    }

    if (year) {
        params.primary_release_year = year;
    }

    const response = await axios.get(
        `${BASE_URL}/discover/movie`,
        { params }
    );

    return response.data;
};

exports.getMovieDetails = async (tmdbID) => {

    const response = await client.get(`/movie/${tmdbID}`);

    return response.data;
};

exports.getGenres = async () => {

    const response = await axios.get(
        `${BASE_URL}/genre/movie/list`,
        {
            params: {
                api_key: API_KEY,
                language: LANGUAGE
            }
        }
    );

    return response.data.genres;
};