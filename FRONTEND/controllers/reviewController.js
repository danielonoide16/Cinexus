function mostrarResenas() {
    if (!movieId) return;

    ajax('GET', `/reviews/movie/${movieId}`, null, function(data, status) {

        const contenedor = document.getElementById('contenedorResenas');

        if (status !== 200) {
            contenedor.innerHTML = '<p class="text-danger">Error loading reviews.</p>';
            return;
        }

        if (!data.length) {
            contenedor.innerHTML = '<p class="text-secondary">No reviews yet.</p>';
            return;
        }

        contenedor.innerHTML = data.map(r => {

            const isMine =
                usuario &&
                r.user &&
                (r.user._id === usuario._id);

            return `
                <div class="tarjeta-resena">

                    <div class="d-flex justify-content-between align-items-start">

                        <div>
                            <strong class="text-white">
                                ${r.user?.name || 'Anonymous'}
                            </strong>

                            <div class="estrellas">
                                ${'★'.repeat(r.rating)}
                                ${'☆'.repeat(5 - r.rating)}
                            </div>
                        </div>

                        <div class="text-end">

                            <small class="text-secondary d-block mb-2">
                                ${new Date(r.createdAt).toLocaleDateString()}
                            </small>

                            ${
                                isMine
                                    ? `
                                    <button
                                        class="btn btn-sm btn-outline-danger"
                                        onclick="openDeleteReviewModal('${r._id}')"
                                    >
                                        Delete
                                    </button>
                                    `
                                    : ''
                            }

                        </div>

                    </div>

                    <p class="text-white-50 mb-0 mt-2">
                        ${r.comment}
                    </p>

                </div>
            `;
        }).join('');
    });
}

function openDeleteReviewModal(reviewId) {
    reviewToDelete = reviewId;
    deleteReviewModal.show();
}

function confirmDeleteReview() {

    if (!reviewToDelete) return;

    ajax(
        'DELETE',
        `/reviews/${reviewToDelete}`,
        null,
        function(data, status) {

            if (status !== 200) {
                alert(data?.error || 'Could not delete review.');
                return;
            }

            deleteReviewModal.hide();
            reviewToDelete = null;

            mostrarResenas();
        }
    );
}

function publicarResena() {
    const texto = document.getElementById('textoResena').value.trim();

    if (!movieId) {
        alert('Movie details are still loading.');
        return;
    }

    if (!estrellasSeleccionadas || !texto) {
        alert('Select a rating and write a review.');
        return;
    }

    ajax(
        'POST',
        '/reviews',
        {
            movieId,
            rating: estrellasSeleccionadas,
            comment: texto
        },
        function (data, status) {
            if (status !== 200 && status !== 201) {
                alert(data?.error || 'Could not publish review.');
                return;
            }

            document.getElementById('textoResena').value = '';
            estrellasSeleccionadas = 0;
            resaltarEstrellas(0);

            mostrarResenas();
        }
    );
}


function loadMyReviews() {
    ajax('GET', '/reviews/me', null, function(data, status) {

        const container = document.getElementById('myReviewsContainer');

        if (status !== 200) {
            container.innerHTML = '<p class="text-danger">Could not load reviews.</p>';
            return;
        }

        if (!data.length) {
            container.innerHTML = '<p class="text-secondary">You have not written any reviews yet.</p>';
            return;
        }

        container.innerHTML = data.map(r => `
            <article class="review" onclick="goToMovie('${r.movie.imdbID}')">

                <h4>${r.movie.title}</h4>

                <div class="review-meta">
                    <span class="stars">
                        ${'★'.repeat(r.rating)}
                        ${'☆'.repeat(5 - r.rating)}
                    </span>

                    <span class="date">
                        ${new Date(r.createdAt).toLocaleDateString()}
                    </span>
                </div>

                <p>${r.comment}</p>

            </article>
        `).join('');

        const reviewsTab = document.querySelectorAll(".tabs li")[0];
        reviewsTab.textContent = `My Reviews (${data.length})`;
    });
}
