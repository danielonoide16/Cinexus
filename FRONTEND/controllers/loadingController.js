const APP_LOADING_LOTTIE_PATH = '../assets/lottie/loading-screen.json';
const APP_LOADING_MIN_VISIBLE_MS = 350;

(function () {
    let overlayElement = null;
    let captionElement = null;
    let pendingRequests = 0;
    let pageBooting = true;
    let visibleSince = 0;
    let hideTimer = null;

    function ensureLottiePlayerScript() {
        if (window.customElements && window.customElements.get('lottie-player')) {
            return;
        }

        if (document.querySelector('script[data-lottie-player-script]')) {
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js';
        script.defer = true;
        script.setAttribute('data-lottie-player-script', 'true');
        document.head.appendChild(script);
    }

    function ensureOverlay() {
        if (overlayElement) {
            return overlayElement;
        }

        overlayElement = document.createElement('div');
        overlayElement.id = 'appLoadingOverlay';
        overlayElement.className = 'app-loading-overlay is-hidden';
        overlayElement.innerHTML = `
            <div class="app-loading-card" role="status" aria-live="polite">
                <lottie-player
                    class="app-loading-player"
                    src="${APP_LOADING_LOTTIE_PATH}"
                    background="transparent"
                    speed="1"
                    autoplay
                    loop
                ></lottie-player>
                <p class="app-loading-caption">Loading...</p>
            </div>
        `;

        document.body.appendChild(overlayElement);
        captionElement = overlayElement.querySelector('.app-loading-caption');

        return overlayElement;
    }

    function showLoading(message) {
        const overlay = ensureOverlay();

        if (hideTimer) {
            clearTimeout(hideTimer);
            hideTimer = null;
        }

        if (captionElement && message) {
            captionElement.textContent = message;
        }

        overlay.classList.remove('is-hidden');
        document.body.classList.add('app-loading-active');
        visibleSince = Date.now();
    }

    function hideLoading() {
        const overlay = ensureOverlay();
        const elapsed = Date.now() - visibleSince;
        const remaining = Math.max(APP_LOADING_MIN_VISIBLE_MS - elapsed, 0);

        if (hideTimer) {
            clearTimeout(hideTimer);
        }

        hideTimer = setTimeout(function () {
            overlay.classList.add('is-hidden');
            document.body.classList.remove('app-loading-active');
        }, remaining);
    }

    function requestStarted(message) {
        pendingRequests += 1;
        showLoading(message || 'Loading...');
    }

    function requestFinished() {
        pendingRequests = Math.max(0, pendingRequests - 1);

        if (!pageBooting && pendingRequests === 0) {
            hideLoading();
        }
    }

    window.AppLoading = {
        show: showLoading,
        hide: hideLoading,
        requestStarted: requestStarted,
        requestFinished: requestFinished
    };

    document.addEventListener('DOMContentLoaded', function () {
        ensureLottiePlayerScript();
        ensureOverlay();
        showLoading('Loading page...');
    });

    window.addEventListener('load', function () {
        pageBooting = false;

        if (pendingRequests === 0) {
            hideLoading();
        }
    });
})();
