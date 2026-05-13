let allReviews = [];
let reviewPage = 0;
const REVIEWS_PER_PAGE = 5;

function mostrarResenas() {
    if (!movieId) return;

    ajax('GET', `/reviews/movie/${movieId}`, null, function(data, status) {

        const contenedor = document.getElementById('contenedorResenas');

        if (status !== 200) {
            contenedor.innerHTML = '<p class="text-danger">Error loading reviews.</p>';
            return;
        }

        // Detectar si el usuario ya reseñó esta película
        const currentUser = JSON.parse(localStorage.getItem('user'));
        const currentUserId = currentUser?._id || currentUser?.id;
        const myReview = data.find(r => r.user && r.user._id === currentUserId);
        const btn = document.querySelector('.caja-oscura .btn-morado');
        if (myReview) {
            btn.textContent = 'Update';
            document.getElementById('textoResena').value = myReview.comment;
            estrellasSeleccionadas = myReview.rating;
            resaltarEstrellas(myReview.rating);
        } else {
            btn.textContent = 'Post';
        }

        if (!data.length) {
            contenedor.innerHTML = '<p class="text-secondary">No reviews yet.</p>';
            return;
        }

        allReviews = data;
        reviewPage = 0;
        contenedor.innerHTML = '';
        const oldPag = document.getElementById('reviewPagination');
        if (oldPag) oldPag.remove();
        renderReviewPage();
    });
}

function renderReviewPage() {
    const contenedor = document.getElementById('contenedorResenas');
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const currentUserId = currentUser?._id || currentUser?.id;
    const totalPages = Math.ceil(allReviews.length / REVIEWS_PER_PAGE);

    const start = reviewPage * REVIEWS_PER_PAGE;
    const slice = allReviews.slice(start, start + REVIEWS_PER_PAGE);

    contenedor.innerHTML = slice.map(r => {
        const isMine = currentUserId && r.user && (r.user._id === currentUserId);
        return `
            <div class="tarjeta-resena">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="d-flex align-items-center gap-2">
                        ${
                            r.user?.avatarUrl
                                ? `<div class="avatar is-clickable" style="width:45px;height:45px;overflow:hidden;cursor:pointer;" onclick="goToUserProfile('${r.user._id}')">
                                    <img src="${API.replace('/api','') + r.user.avatarUrl}" alt="avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">
                                  </div>`
                                : `<div class="avatar is-clickable" style="width:45px;height:45px;cursor:pointer;" onclick="goToUserProfile('${r.user?._id}')">
                                    ${getInitials(r.user?.name || 'A')}
                                  </div>`
                        }
                        <div>
                            <strong class="text-white" style="cursor:pointer;" onclick="goToUserProfile('${r.user?._id}')">
                                ${r.user?.name || 'Anonymous'}
                            </strong>
                            <div class="estrellas">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
                        </div>
                    </div>
                    <div class="text-end">
                        <small class="text-secondary d-block mb-2">${new Date(r.createdAt).toLocaleDateString()}</small>
                        ${isMine ? `<button class="btn btn-sm btn-outline-danger" onclick="openDeleteReviewModal('${r._id}')">Delete</button>` : ''}
                    </div>
                </div>
                <p class="text-white-50 mb-0 mt-2">${r.comment}</p>
            </div>
        `;
    }).join('');

    // Controles de paginación
    if (totalPages > 1) {
        contenedor.insertAdjacentHTML('afterend',
            `<div id="reviewPagination" class="d-flex justify-content-center align-items-center gap-3 mt-3">
                <button class="btn btn-outline-light btn-sm" onclick="changeReviewPage(-1)" ${reviewPage === 0 ? 'disabled' : ''}>&laquo; Prev</button>
                <span class="text-white">${reviewPage + 1} / ${totalPages}</span>
                <button class="btn btn-outline-light btn-sm" onclick="changeReviewPage(1)" ${reviewPage === totalPages - 1 ? 'disabled' : ''}>Next &raquo;</button>
            </div>`);
    }
}

function changeReviewPage(dir) {
    const totalPages = Math.ceil(allReviews.length / REVIEWS_PER_PAGE);
    reviewPage += dir;
    if (reviewPage < 0) reviewPage = 0;
    if (reviewPage >= totalPages) reviewPage = totalPages - 1;
    const oldPag = document.getElementById('reviewPagination');
    if (oldPag) oldPag.remove();
    renderReviewPage();
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
            <article class="review" onclick="goToMovie('${r.movie.tmdbID}')">

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


function renderPublicReviews(reviews) {

    const container = document.getElementById('myReviewsContainer');

    if (!reviews.length) {
        container.innerHTML = `
            <p class="text-secondary">
                No reviews yet.
            </p>
        `;
        return;
    }

    container.innerHTML = reviews.map(review => {

        //const movie = review.movieId;
        const movie = review.movie;

        return `
            <div class="review-card mb-3">
                <div class="d-flex gap-3">

                    <img
                        src="${movie.poster || 'https://www.juliedray.com/wp-content/uploads/2022/01/sans-affiche.png'}"
                        style="width:80px;border-radius:8px;cursor:pointer;"
                        onclick="goToMovie('${movie.tmdbID}')"
                    >

                    <div class="flex-grow-1">

                        <h5
                            style="cursor:pointer;"
                            onclick="goToMovie('${movie.tmdbID}')"
                        >
                            ${movie.title}
                        </h5>

                        <div class="mb-2">
                            ⭐ ${review.rating}/5
                        </div>

                        <p class="mb-0">
                            ${review.comment || ''}
                        </p>

                    </div>

                </div>
            </div>
        `;
    }).join('');
}