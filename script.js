const audio = document.getElementById("audio");

const musicInput = document.getElementById("musicInput");
const songList = document.getElementById("songList");
const favoriteList = document.getElementById("favoriteList");
const libraryList = document.getElementById("libraryList");

const emptyState = document.getElementById("emptyState");
const favoriteEmpty = document.getElementById("favoriteEmpty");

const playBtn = document.getElementById("playBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

const shuffleBtn = document.getElementById("shuffleBtn");
const repeatBtn = document.getElementById("repeatBtn");

const progress = document.getElementById("progress");
const volume = document.getElementById("volume");

const currentTitle = document.getElementById("currentTitle");
const currentArtist = document.getElementById("currentArtist");
const currentTime = document.getElementById("currentTime");
const duration = document.getElementById("duration");

const albumArt = document.getElementById("albumArt");
const currentFavorite = document.getElementById("currentFavorite");

const searchInput = document.getElementById("searchInput");

const songCount = document.getElementById("songCount");
const librarySongs = document.getElementById("librarySongs");
const libraryFavorites = document.getElementById("libraryFavorites");

const disc = document.querySelector(".disc");
const menuBtn = document.getElementById("menuBtn");

let songs = [];
let currentIndex = -1;

let isShuffle = false;
let isRepeat = false;

let favorites = JSON.parse(
    localStorage.getItem("mlvcFavorites") || "[]"
);


/* =========================
   ADD MUSIC
========================= */

musicInput.addEventListener("change", (event) => {

    const files = [...event.target.files];

    files.forEach(file => {

        const song = {
            id: Date.now() + Math.random(),
            title: cleanFileName(file.name),
            artist: "Local Music",
            file,
            url: URL.createObjectURL(file)
        };

        songs.push(song);

    });

    renderEverything();

    if (currentIndex === -1 && songs.length > 0) {
        loadSong(0, false);
    }

    musicInput.value = "";
});


function cleanFileName(name) {

    return name
        .replace(/\.[^/.]+$/, "")
        .replace(/[_-]/g, " ")
        .trim();

}


/* =========================
   RENDER
========================= */

function renderEverything() {

    const query = searchInput.value.toLowerCase().trim();

    const filteredSongs = songs.filter(song =>
        song.title.toLowerCase().includes(query)
    );

    renderList(songList, filteredSongs);

    const favoriteSongs = songs.filter(song =>
        favorites.includes(song.id)
    );

    renderList(favoriteList, favoriteSongs);

    renderList(libraryList, songs);

    emptyState.style.display =
        songs.length === 0 ? "block" : "none";

    favoriteEmpty.style.display =
        favoriteSongs.length === 0 ? "block" : "none";

    songCount.textContent =
        `${songs.length} ${songs.length === 1 ? "song" : "songs"}`;

    librarySongs.textContent = songs.length;
    libraryFavorites.textContent = favoriteSongs.length;

}


function renderList(container, list) {

    container.innerHTML = "";

    list.forEach((song) => {

        const realIndex = songs.findIndex(
            item => item.id === song.id
        );

        const isFavorite = favorites.includes(song.id);

        const div = document.createElement("div");

        div.className =
            "song " +
            (realIndex === currentIndex ? "active" : "");

        div.innerHTML = `

            <div class="song-number">
                ${realIndex + 1}
            </div>

            <div class="song-main">

                <div class="song-title">
                    ${escapeHTML(song.title)}
                </div>

                <div class="song-name">
                    ${escapeHTML(song.artist)}
                </div>

            </div>

            <div class="song-duration">
                ${formatTime(song.duration || 0)}
            </div>

            <div class="song-actions">

                <button
                    class="icon-btn ${isFavorite ? "favorite" : ""}"
                    data-favorite="${song.id}"
                >
                    ${isFavorite ? "♥" : "♡"}
                </button>

                <button
                    class="icon-btn"
                    data-play="${song.id}"
                >
                    ▶
                </button>

            </div>
        `;

        container.appendChild(div);

    });

}


/* =========================
   SONG CLICK
========================= */

document.addEventListener("click", (event) => {

    const playId = event.target.dataset.play;

    if (playId) {

        const index = songs.findIndex(
            song => String(song.id) === playId
        );

        if (index !== -1) {
            loadSong(index, true);
        }

    }


    const favoriteId = event.target.dataset.favorite;

    if (favoriteId) {

        const id = Number(favoriteId);

        toggleFavorite(id);

    }

});


/* =========================
   LOAD SONG
========================= */

function loadSong(index, autoplay = true) {

    if (!songs[index]) return;

    currentIndex = index;

    const song = songs[index];

    audio.src = song.url;

    currentTitle.textContent = song.title;
    currentArtist.textContent = song.artist;

    updateFavoriteButton();

    renderEverything();

    if (autoplay) {

        audio.play()
            .catch(() => {});

    }

}


/* =========================
   PLAY / PAUSE
========================= */

playBtn.addEventListener("click", () => {

    if (songs.length === 0) return;

    if (currentIndex === -1) {
        loadSong(0, true);
        return;
    }

    if (audio.paused) {
        audio.play().catch(() => {});
    } else {
        audio.pause();
    }

});


audio.addEventListener("play", () => {

    playBtn.textContent = "Ⅱ";

    disc.classList.add("playing");

});


audio.addEventListener("pause", () => {

    playBtn.textContent = "▶";

    disc.classList.remove("playing");

});


/* =========================
   NEXT
========================= */

nextBtn.addEventListener("click", nextSong);


function nextSong() {

    if (songs.length === 0) return;

    let nextIndex;

    if (isShuffle) {

        nextIndex = Math.floor(
            Math.random() * songs.length
        );

        if (songs.length > 1 && nextIndex === currentIndex) {
            nextIndex =
                (nextIndex + 1) % songs.length;
        }

    } else {

        nextIndex =
            (currentIndex + 1) % songs.length;

    }

    loadSong(nextIndex, true);

}


/* =========================
   PREVIOUS
========================= */

prevBtn.addEventListener("click", () => {

    if (songs.length === 0) return;

    if (audio.currentTime > 3) {

        audio.currentTime = 0;
        return;

    }

    const previous =
        (currentIndex - 1 + songs.length) %
        songs.length;

    loadSong(previous, true);

});


/* =========================
   AUTO NEXT
========================= */

audio.addEventListener("ended", () => {

    if (isRepeat) {

        audio.currentTime = 0;
        audio.play().catch(() => {});

    } else {

        nextSong();

    }

});


/* =========================
   SHUFFLE
========================= */

shuffleBtn.addEventListener("click", () => {

    isShuffle = !isShuffle;

    shuffleBtn.classList.toggle(
        "active",
        isShuffle
    );

});


/* =========================
   REPEAT
========================= */

repeatBtn.addEventListener("click", () => {

    isRepeat = !isRepeat;

    repeatBtn.classList.toggle(
        "active",
        isRepeat
    );

});


/* =========================
   PROGRESS
========================= */

audio.addEventListener("loadedmetadata", () => {

    duration.textContent =
        formatTime(audio.duration);

    progress.max = audio.duration || 100;

});


audio.addEventListener("timeupdate", () => {

    progress.value =
        audio.currentTime;

    currentTime.textContent =
        formatTime(audio.currentTime);

});


progress.addEventListener("input", () => {

    audio.currentTime =
        Number(progress.value);

});


/* =========================
   VOLUME
========================= */

audio.volume = 0.8;

volume.addEventListener("input", () => {

    audio.volume =
        Number(volume.value);

});


/* =========================
   FAVORITES
========================= */

function toggleFavorite(id) {

    if (favorites.includes(id)) {

        favorites =
            favorites.filter(item => item !== id);

    } else {

        favorites.push(id);

    }

    localStorage.setItem(
        "mlvcFavorites",
        JSON.stringify(favorites)
    );

    updateFavoriteButton();
    renderEverything();

}


function updateFavoriteButton() {

    if (currentIndex === -1) {

        currentFavorite.classList.remove("active");
        currentFavorite.textContent = "♡";
        return;

    }

    const id = songs[currentIndex].id;

    const active =
        favorites.includes(id);

    currentFavorite.classList.toggle(
        "active",
        active
    );

    currentFavorite.textContent =
        active ? "♥" : "♡";

}


currentFavorite.addEventListener("click", () => {

    if (currentIndex === -1) return;

    toggleFavorite(
        songs[currentIndex].id
    );

});


/* =========================
   SEARCH
========================= */

searchInput.addEventListener("input", () => {

    renderEverything();

});


/* =========================
   NAVIGATION
========================= */

const navButtons =
    document.querySelectorAll(".nav-btn");

const sections = {
    home: document.getElementById("homeSection"),
    favorites: document.getElementById("favoritesSection"),
    library: document.getElementById("librarySection")
};


navButtons.forEach(button => {

    button.addEventListener("click", () => {

        const target =
            button.dataset.section;

        navButtons.forEach(btn =>
            btn.classList.remove("active")
        );

        button.classList.add("active");

        Object.values(sections).forEach(section =>
            section.classList.remove("active")
        );

        sections[target].classList.add("active");

        document
            .querySelector(".sidebar")
            .classList.remove("open");

    });

});


/* =========================
   PLAY ALL
========================= */

document.getElementById("playAllBtn")
    .addEventListener("click", () => {

        if (songs.length === 0) return;

        loadSong(0, true);

    });


/* =========================
   MOBILE MENU
========================= */

menuBtn.addEventListener("click", () => {

    document
        .querySelector(".sidebar")
        .classList.toggle("open");

});


/* =========================
   TIME
========================= */

function formatTime(seconds) {

    if (!Number.isFinite(seconds)) {
        return "0:00";
    }

    const mins =
        Math.floor(seconds / 60);

    const secs =
        Math.floor(seconds % 60)
            .toString()
            .padStart(2, "0");

    return `${mins}:${secs}`;

}


/* =========================
   SECURITY
========================= */

function escapeHTML(text) {

    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================
   PWA
========================= */

if ("serviceWorker" in navigator) {

    window.addEventListener("load", () => {

        navigator.serviceWorker
            .register("./sw.js")
            .then(() => {
                console.log("MLVC Playlist PWA ready");
            })
            .catch(error => {
                console.error(
                    "PWA registration failed:",
                    error
                );
            });

    });

}


/* =========================
   START
========================= */

renderEverything();

/* =========================
   OPENING SCREEN
========================= */

window.addEventListener("load", () => {

    const openingScreen =
        document.getElementById("openingScreen");

    setTimeout(() => {

        if (openingScreen) {
            openingScreen.remove();
        }

    }, 3500);

});
