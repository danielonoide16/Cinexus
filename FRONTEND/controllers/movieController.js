function loadImage(url) {
    return new Promise(resolve => {
        const img = new Image();

        img.onload = () => {
            resolve(true);  
        };

        img.onerror = () => resolve(false);

        img.src = url;
    });
}

function loadGenres() {

    ajax('GET', '/movies/genres', null,
        function(genres, status) {

        if (status !== 200) return;

        const select =
            document.getElementById('genreFilter');

        select.innerHTML =
            '<option value="">All Genres</option>';

        genres.forEach(g => {

            select.innerHTML += `
                <option value="${g.id}">
                    ${g.name}
                </option>
            `;
        });
    });
}

function loadYears() {

    ajax('GET', '/movies/years', null,
        function(years, status) {

        if (status !== 200) return;

        const select =
            document.getElementById('yearFilter');

        select.innerHTML =
            '<option value="all">All Years</option>';

        years.forEach(year => {

            select.innerHTML += `
                <option value="${year}">
                    ${year}
                </option>
            `;
        });
    });
}

async function filterValidImages(movies) {
    const checks = await Promise.all(
        movies.map(async m => {
            if (!m.poster) return null;

            const isValid = await loadImage(m.poster);
            return isValid ? m : null;
        })
    );

    return checks.filter(Boolean);
}

function updatePagination(pagination) {
    document.getElementById('pageInfo').textContent = `Page ${pagination.page} of ${pagination.totalPages}`;
    document.getElementById('prevPageBtn').disabled = !pagination.hasPrev;
    document.getElementById('nextPageBtn').disabled = !pagination.hasNext;
}

async function renderMovies(page = 1) {

    currentPage = page;

    const search =
        document.getElementById('searchInput')
            .value
            .trim();

    const genre =
        document.getElementById('genreFilter')
            .value;

    const year =
        document.getElementById('yearFilter')
            .value
            .trim();

    const sort =
        document.getElementById('sortFilter')
            ?.value || 'popularity.desc';

    let url = `/movies?page=${page}`;

    if (search) {
        url += `&q=${encodeURIComponent(search)}`;
    }

    if (genre) {
        url += `&genre=${encodeURIComponent(genre)}`;
    }

    if (year && year !== 'all') {
        url += `&year=${encodeURIComponent(year)}`;
    }

    if (sort) {
        url += `&sort=${encodeURIComponent(sort)}`;
    }

    ajax('GET', url, null,
        async function(data, status) {

        const container =
            document.getElementById('moviesContainer');

        container.innerHTML = '';

        if (status !== 200) {

            container.innerHTML =
                "<p class='text-white'>Error loading movies</p>";

            return;
        }

        const movies = data.items || [];

        const pagination =
            data.pagination || {
                page: 1,
                totalPages: 1,
                hasPrev: false,
                hasNext: false
            };

        if (!movies.length) {

            container.innerHTML =
                "<p class='text-white'>No results</p>";

            updatePagination(pagination);

            return;
        }

        const validMovies =
            await filterValidImages(movies);

        validMovies.forEach(m => {

            const posterUrl =
                m.poster ||
                'https://www.juliedray.com/wp-content/uploads/2022/01/sans-affiche.png';

            container.innerHTML += `
                <div class="col-md-3">

                    <div
                        class="movie-card"
                        onclick="goToMovie('${m.tmdbID}')"
                    >

                        <img
                            src="${posterUrl}"
                            class="w-100"
                        >

                        <div class="p-2 text-white">

                            <strong>
                                ${m.title}
                            </strong>

                            <br>

                            <small>
                                ${m.year || ''}
                                ${m.imdbRating
                                    ? ` • ⭐ ${m.imdbRating.toFixed(1)}`
                                    : ''}
                            </small>

                        </div>

                    </div>

                </div>
            `;
        });

        updatePagination(pagination);
    });
}

function loadMovieDetails() {
    if (!tmdbID) {
        document.getElementById('titulo').textContent = 'Movie not found';
        document.getElementById('descripcion').textContent = 'Missing tmdbID in URL.';
        return;
    }

    
    ajax('GET', `/movies/tmdb/${encodeURIComponent(tmdbID)}`, null, function (movie, status) {
        if (status !== 200) {
            document.getElementById('titulo').textContent = 'Movie not found';
            document.getElementById('descripcion').textContent = 'Could not load movie details.';
            return;
        }

        
        tituloPelicula = movie.title || 'Unknown movie';
        movieId = movie._id;
        document.getElementById('titulo').textContent = tituloPelicula;
        document.getElementById('meta').textContent = formatMovieMeta(movie);
        document.getElementById('descripcion').textContent = movie.plot || 'No description available.';
        document.getElementById('poster').src = movie.poster || 'https://www.juliedray.com/wp-content/uploads/2022/01/sans-affiche.png';
        document.getElementById('poster').alt = tituloPelicula;

        const trailerFrame = document.getElementById('trailerFrame');
        const trailerMessage = document.getElementById('trailerMessage');
        if (movie.trailer && movie.trailer.url) {
            trailerFrame.src = movie.trailer.url;
            trailerMessage.textContent = movie.trailer.title ? `Trailer: ${movie.trailer.title}` : '';
        } else {
            trailerFrame.removeAttribute('src');
            trailerMessage.textContent = 'Trailer not available right now.';
        }

        mostrarResenas();
    });
}