
const menuToggle = document.getElementById("menu-toggle");
const navbar = document.getElementById("navbar");
const themeToggle = document.getElementById("theme-toggle");
const musicTrack = document.getElementById("music-track");
const musicToggle = document.getElementById("music-toggle");
const backgroundMusic = document.getElementById("background-music");
const musicStatus = document.getElementById("music-status");
const year = document.getElementById("year");
const memoryViewer = document.getElementById("memory-viewer");
const memoryViewerImage = document.getElementById("memory-viewer-image");
const memoryViewerCaption = document.getElementById("memory-viewer-caption");
const memoryViewerStage = document.getElementById("memory-viewer-stage");
const memoryZoom = document.getElementById("memory-zoom");
const memoryZoomValue = document.getElementById("memory-zoom-value");
let memoryZoomScale = 1;
let memoryPanX = 0;
let memoryPanY = 0;
let activePointerId = null;
let pointerStartX = 0;
let pointerStartY = 0;
let panStartX = 0;
let panStartY = 0;

function updateMemoryZoom() {
    const zoomPercent = Math.round(memoryZoomScale * 100);
    const maxPanX = Math.max(
        0,
        (memoryViewerImage.offsetWidth * memoryZoomScale - memoryViewerStage.clientWidth) / 2
    );
    const maxPanY = Math.max(
        0,
        (memoryViewerImage.offsetHeight * memoryZoomScale - memoryViewerStage.clientHeight) / 2
    );

    memoryPanX = Math.max(-maxPanX, Math.min(maxPanX, memoryPanX));
    memoryPanY = Math.max(-maxPanY, Math.min(maxPanY, memoryPanY));
    memoryViewerImage.style.transform =
        "translate(" + memoryPanX + "px, " + memoryPanY + "px) scale(" + memoryZoomScale + ")";
    memoryZoomValue.value = zoomPercent + "%";
    memoryZoomValue.textContent = zoomPercent + "%";
}

document.querySelectorAll(".memory-photo-button").forEach(function (button) {
    button.addEventListener("click", function () {
        const thumbnail = button.querySelector("img");
        const caption = button.getAttribute("aria-label").replace("View ", "");
        memoryViewerImage.src = thumbnail.src;
        memoryViewerImage.alt = "Enlarged view of " + caption;
        memoryViewerCaption.textContent = caption;
        memoryZoom.value = "1";
        memoryZoomScale = 1;
        memoryPanX = 0;
        memoryPanY = 0;
        memoryViewer.showModal();
        updateMemoryZoom();
    });
});

document.getElementById("memory-viewer-close").addEventListener("click", function () {
    memoryViewer.close();
});

document.getElementById("memory-viewer-reset").addEventListener("click", function () {
    memoryZoom.value = "1";
    memoryZoomScale = 1;
    memoryPanX = 0;
    memoryPanY = 0;
    updateMemoryZoom();
});

memoryZoom.addEventListener("input", function () {
    memoryZoomScale = Number(memoryZoom.value);
    updateMemoryZoom();
});

memoryViewerImage.addEventListener("load", updateMemoryZoom);

memoryViewerImage.addEventListener("pointerdown", function (event) {
    activePointerId = event.pointerId;
    pointerStartX = event.clientX;
    pointerStartY = event.clientY;
    panStartX = memoryPanX;
    panStartY = memoryPanY;
    memoryViewerImage.setPointerCapture(event.pointerId);
});

memoryViewerImage.addEventListener("pointermove", function (event) {
    if (event.pointerId !== activePointerId) {
        return;
    }

    memoryPanX = panStartX + event.clientX - pointerStartX;
    memoryPanY = panStartY + event.clientY - pointerStartY;
    updateMemoryZoom();
});

function stopMemoryPan(event) {
    if (event.pointerId === activePointerId) {
        activePointerId = null;
    }
}

memoryViewerImage.addEventListener("pointerup", stopMemoryPan);
memoryViewerImage.addEventListener("pointercancel", stopMemoryPan);

memoryViewer.addEventListener("click", function (event) {
    if (event.target === memoryViewer) {
        memoryViewer.close();
    }
});

function updateMusicButton(isPlaying) {
    musicToggle.textContent = isPlaying ? "❚❚" : "▶";
    musicToggle.setAttribute("aria-label", isPlaying ? "Pause music" : "Play music");
    musicToggle.title = isPlaying ? "Pause music" : "Play music";
}

// Mobile navigation menu
menuToggle.addEventListener("click", function () {
    navbar.classList.toggle("show");

    menuToggle.textContent = navbar.classList.contains("show")
        ? "✕"
        : "☰";
});

// Close menu after clicking a link
document.querySelectorAll(".navbar a").forEach(function (link) {
    link.addEventListener("click", function () {
        navbar.classList.remove("show");
        menuToggle.textContent = "☰";
    });
});

// Dark and light mode
themeToggle.addEventListener("click", function () {
    document.body.classList.toggle("light-mode");

    const isLight = document.body.classList.contains("light-mode");

    themeToggle.textContent = isLight ? "☀" : "☾";
    themeToggle.setAttribute(
        "aria-label",
        isLight ? "Switch to dark mode" : "Switch to light mode"
    );
});

musicTrack.addEventListener("change", function () {
    const wasPlaying = !backgroundMusic.paused;
    backgroundMusic.src = musicTrack.value;
    backgroundMusic.load();
    musicStatus.textContent = "Selected " + musicTrack.options[musicTrack.selectedIndex].text;

    if (wasPlaying) {
        backgroundMusic.play().catch(function (error) {
            musicStatus.textContent = "Could not play music: " + error.message;
            updateMusicButton(false);
        });
    } else {
        musicStatus.textContent = "Music paused";
    }
});

musicToggle.addEventListener("click", function () {
    if (backgroundMusic.paused) {
        musicStatus.textContent = "Loading music";
        backgroundMusic.play().catch(function (error) {
            musicStatus.textContent = "Could not play music: " + error.message;
            updateMusicButton(false);
        });
    } else {
        backgroundMusic.pause();
    }
});

backgroundMusic.addEventListener("play", function () {
    updateMusicButton(true);
    musicStatus.textContent = "Playing " + musicTrack.options[musicTrack.selectedIndex].text;
});

backgroundMusic.addEventListener("pause", function () {
    updateMusicButton(false);
    musicStatus.textContent = "Music paused";
});

backgroundMusic.addEventListener("error", function () {
    musicStatus.textContent = "Could not load " + musicTrack.options[musicTrack.selectedIndex].text
        + ". Make sure the MP3 file is in the project folder.";
    updateMusicButton(false);
});

// Automatically update the footer year
year.textContent = new Date().getFullYear();

// Reveal page content as it enters the viewport.
const revealElements = document.querySelectorAll(
    ".section-heading, .about-content, .card, .memory-card, .contact-card"
);
const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
).matches;

if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver(
        function (entries, observer) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12, rootMargin: "0px 0px -35px 0px" }
    );

    revealElements.forEach(function (element) {
        element.classList.add("reveal");
        revealObserver.observe(element);
    });
}

// Highlight the active navigation link
const sections = document.querySelectorAll("main section");
const navLinks = document.querySelectorAll(".navbar a");

window.addEventListener("scroll", function () {
    let currentSection = "home";

    sections.forEach(function (section) {
        if (window.scrollY >= section.offsetTop - 150) {
            currentSection = section.id;
        }
    });

    navLinks.forEach(function (link) {
        link.classList.toggle(
            "active",
            link.getAttribute("href") === "#" + currentSection
        );
    });
});
