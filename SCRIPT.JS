// ==========================================
// MELVIC MUSIC
// PREMIUM MUSIC PLAYER
// ==========================================


// ================================
// ELEMENTS
// ================================

const audio =
    document.getElementById("audio");

const playBtn =
    document.getElementById("playBtn");

const heroPlayBtn =
    document.getElementById("heroPlayBtn");

const mobilePlay =
    document.getElementById("mobilePlay");

const mobileNext =
    document.getElementById("mobileNext");

const prevBtn =
    document.getElementById("prevBtn");

const nextBtn =
    document.getElementById("nextBtn");

const shuffleBtn =
    document.getElementById("shuffleBtn");

const repeatBtn =
    document.getElementById("repeatBtn");

const favoriteBtn =
    document.getElementById("favoriteBtn");

const progress =
    document.getElementById("progress");

const volume =
    document.getElementById("volume");

const muteBtn =
    document.getElementById("muteBtn");

const searchInput =
    document.getElementById("searchInput");

const playlist =
    document.getElementById("playlist");

const songTitle =
    document.getElementById("songTitle");

const songArtist =
    document.getElementById("songArtist");

const albumCover =
    document.getElementById("albumCover");

const currentTime =
    document.getElementById("currentTime");

const duration =
    document.getElementById("duration");

const songCount =
    document.getElementById("songCount");

const playlistTitle =
    document.getElementById("playlistTitle");

const equalizer =
    document.getElementById("equalizer");

const musicInput =
    document.getElementById("musicInput");

const addMusicBtn =
    document.getElementById("addMusicBtn");

const addSmallBtn =
    document.getElementById("addSmallBtn");

const homeBtn =
    document.getElementById("homeBtn");

const favoritesBtn =
    document.getElementById("favoritesBtn");

const queueBtn =
    document.getElementById("queueBtn");

const mobileTitle =
    document.getElementById("mobileTitle");

const mobileArtist =
    document.getElementById("mobileArtist");

const mobileCover =
    document.getElementById("mobileCover");


// ================================
// STATE
// ================================

let songs = [];

let currentIndex = -1;

let shuffleMode = false;

let repeatMode = false;

let showingFavorites = false;

let showingQueue = false;

let favorites = [];

let queue = [];


// ================================
// SAVED SETTINGS
// ================================

try {

    favorites =
        JSON.parse(
            localStorage.getItem(
                "melvicFavorites"
            )
        ) || [];

} catch {

    favorites = [];

}


const savedVolume =
    localStorage.getItem(
        "melvicVolume"
    );


if (savedVolume !== null) {

    volume.value =
        savedVolume;

    audio.volume =
        Number(savedVolume);

} else {

    audio.volume = 0.8;

}


// ================================
// PLACEHOLDER
// ================================

songs = [
    {
        id: "welcome",
        title: "Add Your Music",
        artist: "Melvic Music",
        src: "",
        duration: 0
    }
];


// ================================
// TIME
// ================================

function formatTime(seconds) {

    if (
        !Number.isFinite(seconds) ||
        seconds < 0
    ) {
        return "0:00";
    }

    const minutes =
        Math.floor(
            seconds / 60
        );

    const secondsLeft =
        Math.floor(
            seconds % 60
        );

    return (
        minutes +
        ":" +
        String(secondsLeft)
            .padStart(2, "0")
    );
}


// ================================
// COVER
// ================================

function setCover(element, song) {

    if (!element) {
        return;
    }

    const value =
        song.title
            .split("")
            .reduce(
                (sum, char) =>
                    sum +
                    char.charCodeAt(0),
                0
            );

    const rotation =
        value % 360;

    element.style.background =
        `linear-gradient(
            ${rotation}deg,
            #27e76d,
            #123b24 45%,
            #101218
        )`;

}


// ================================
// LOAD SONG
// ================================

function loadSong(index) {

    if (
        index < 0 ||
        index >= songs.length
    ) {
        return;
    }

    currentIndex = index;

    const song =
        songs[currentIndex];


    songTitle.textContent =
        song.title;

    songArtist.textContent =
        song.artist;


    mobileTitle.textContent =
        song.title;

    mobileArtist.textContent =
        song.artist;


    setCover(
        albumCover,
        song
    );

    setCover(
        mobileCover,
        song
    );


    if (song.src) {

        audio.src =
            song.src;

    } else {

        audio.removeAttribute(
            "src"
        );

        audio.load();

    }


    progress.value = 0;

    currentTime.textContent =
        "0:00";

    duration.textContent =
        song.duration
            ? formatTime(
                song.duration
            )
            : "0:00";


    updateFavorite();

    updateActiveSong();

}


// ================================
// PLAY
// ================================

async function playSong() {

    if (
        currentIndex < 0
    ) {
        return;
    }


    const song =
        songs[currentIndex];


    if (!song.src) {

        openMusicPicker();

        return;
    }


    try {

        await audio.play();

    } catch (error) {

        console.log(
            "Unable to play:",
            error
        );

    }

}


// ================================
// PAUSE
// ================================

function pauseSong() {

    audio.pause();

}


// ================================
// TOGGLE
// ================================

function togglePlay() {

    if (audio.paused) {

        playSong();

    } else {

        pauseSong();

    }

}


playBtn.addEventListener(
    "click",
    togglePlay
);

heroPlayBtn.addEventListener(
    "click",
    togglePlay
);

mobilePlay.addEventListener(
    "click",
    togglePlay
);


// ================================
// NEXT
// ================================

function nextSong() {

    if (
        songs.length === 0
    ) {
        return;
    }


    let nextIndex;


    // QUEUE

    if (
        queue.length > 0
    ) {

        const nextId =
            queue.shift();

        const found =
            songs.findIndex(
                song =>
                    song.id === nextId
            );

        if (found !== -1) {

            nextIndex = found;

        }

    }


    // SHUFFLE

    if (
        nextIndex === undefined &&
        shuffleMode &&
        songs.length > 1
    ) {

        do {

            nextIndex =
                Math.floor(
                    Math.random() *
                    songs.length
                );

        } while (
            nextIndex === currentIndex
        );

    }


    // NORMAL

    if (
        nextIndex === undefined
    ) {

        nextIndex =
            currentIndex + 1;


        if (
            nextIndex >= songs.length
        ) {

            nextIndex = 0;

        }

    }


    loadSong(nextIndex);

    playSong();

    renderPlaylist();

}


nextBtn.addEventListener(
    "click",
    nextSong
);

mobileNext.addEventListener(
    "click",
    nextSong
);


// ================================
// PREVIOUS
// ================================

prevBtn.addEventListener(
    "click",
    function() {

        if (
            audio.currentTime > 3
        ) {

            audio.currentTime = 0;

            return;

        }


        let previous =
            currentIndex - 1;


        if (
            previous < 0
        ) {

            previous =
                songs.length - 1;

        }


        loadSong(previous);

        playSong();

    }
);


// ================================
// ENDED
// ================================

audio.addEventListener(
    "ended",
    function() {

        if (repeatMode) {

            audio.currentTime = 0;

            playSong();

        } else {

            nextSong();

        }

    }
);


// ================================
// AUDIO PLAY
// ================================

audio.addEventListener(
    "play",
    function() {

        playBtn.textContent =
            "Ⅱ";

        heroPlayBtn.textContent =
            "Ⅱ Pause";

        mobilePlay.textContent =
            "Ⅱ";


        albumCover.classList.add(
            "playing"
        );

        equalizer.classList.add(
            "active"
        );


        renderPlaylist();

    }
);


// ================================
// AUDIO PAUSE
// ================================

audio.addEventListener(
    "pause",
    function() {

        playBtn.textContent =
            "▶";

        heroPlayBtn.textContent =
            "▶ Play";

        mobilePlay.textContent =
            "▶";


        albumCover.classList.remove(
            "playing"
        );

        equalizer.classList.remove(
            "active"
        );


        renderPlaylist();

    }
);


// ================================
// TIME UPDATE
// ================================

audio.addEventListener(
    "timeupdate",
    function() {

        if (
            !audio.duration
        ) {
            return;
        }


        progress.value =
            (
                audio.currentTime /
                audio.duration
            ) * 100;


        currentTime.textContent =
            formatTime(
                audio.currentTime
            );

    }
);


// ================================
// METADATA
// ================================

audio.addEventListener(
    "loadedmetadata",
    function() {

        duration.textContent =
            formatTime(
                audio.duration
            );


        if (
            currentIndex >= 0
        ) {

            songs[currentIndex]
                .duration =
                audio.duration;

        }


        renderPlaylist();

    }
);


// ================================
// SEEK
// ================================

progress.addEventListener(
    "input",
    function() {

        if (
            !audio.duration
        ) {
            return;
        }


        audio.currentTime =
            (
                Number(progress.value) /
                100
            ) *
            audio.duration;

    }
);


// ================================
// VOLUME
// ================================

volume.addEventListener(
    "input",
    function() {

        audio.volume =
            Number(volume.value);


        localStorage.setItem(
            "melvicVolume",
            volume.value
        );


        updateVolumeIcon();

    }
);


// ================================
// MUTE
// ================================

muteBtn.addEventListener(
    "click",
    function() {

        if (
            audio.volume > 0
        ) {

            audio.dataset.previousVolume =
                audio.volume;

            audio.volume = 0;

            volume.value = 0;

        } else {

            const previous =
                Number(
                    audio.dataset.previousVolume
                ) || 0.8;


            audio.volume =
                previous;

            volume.value =
                previous;

        }


        updateVolumeIcon();

    }
);


function updateVolumeIcon() {

    if (
        audio.volume === 0
    ) {

        muteBtn.textContent =
            "🔇";

    } else if (
        audio.volume < 0.5
    ) {

        muteBtn.textContent =
            "🔉";

    } else {

        muteBtn.textContent =
            "🔊";

    }

}


// ================================
// SHUFFLE
// ================================

shuffleBtn.addEventListener(
    "click",
    function() {

        shuffleMode =
            !shuffleMode;


        shuffleBtn.classList.toggle(
            "active",
            shuffleMode
        );

    }
);


// ================================
// REPEAT
// ================================

repeatBtn.addEventListener(
    "click",
    function() {

        repeatMode =
            !repeatMode;


        repeatBtn.classList.toggle(
            "active",
            repeatMode
        );

    }
);


// ================================
// FAVORITES
// ================================

favoriteBtn.addEventListener(
    "click",
    function() {

        if (
            currentIndex < 0
        ) {
            return;
        }


        const id =
            songs[currentIndex].id;


        if (
            favorites.includes(id)
        ) {

            favorites =
                favorites.filter(
                    value =>
                        value !== id
                );

        } else {

            favorites.push(id);

        }


        saveFavorites();

        updateFavorite();

        renderPlaylist();

    }
);


function saveFavorites() {

    localStorage.setItem(
        "melvicFavorites",
        JSON.stringify(
            favorites
        )
    );

}


function updateFavorite() {

    if (
        currentIndex < 0
    ) {
        return;
    }


    const id =
        songs[currentIndex].id;


    const liked =
        favorites.includes(id);


    favoriteBtn.textContent =
        liked ? "♥" : "♡";


    favoriteBtn.classList.toggle(
        "liked",
        liked
    );

}


// ================================
// SEARCH
// ================================

searchInput.addEventListener(
    "input",
    function() {

        showingFavorites = false;

        showingQueue = false;

        renderPlaylist();

    }
);


// ================================
// VISIBLE SONGS
// ================================

function getVisibleSongs() {

    let visible =
        [...songs];


    if (
        showingFavorites
    ) {

        visible =
            visible.filter(
                song =>
                    favorites.includes(
                        song.id
                    )
            );

    }


    if (
        showingQueue
    ) {

        visible =
            queue
                .map(
                    id =>
                        songs.find(
                            song =>
                                song.id === id
                        )
                )
                .filter(Boolean);

    }


    const query =
        searchInput.value
            .trim()
            .toLowerCase();


    if (
        query &&
        !showingQueue
    ) {

        visible =
            visible.filter(
                song =>
                    song.title
                        .toLowerCase()
                        .includes(query)
                    ||
                    song.artist
                        .toLowerCase()
                        .includes(query)
            );

    }


    return visible;

}


// ================================
// RENDER
// ================================

function renderPlaylist() {

    const visible =
        getVisibleSongs();


    playlist.innerHTML = "";


    if (
        showingFavorites
    ) {

        playlistTitle.textContent =
            "Favorites";

    } else if (
        showingQueue
    ) {

        playlistTitle.textContent =
            "Up Next";

    } else {

        playlistTitle.textContent =
            "Your Music";

    }


    songCount.textContent =
        `${visible.length} ${
            visible.length === 1
                ? "song"
                : "songs"
        }`;


    if (
        visible.length === 0
    ) {

        playlist.innerHTML = `

            <div class="empty">

                <div class="empty-icon">
                    ♪
                </div>

                <strong>
                    ${
                        showingFavorites
                            ? "No favorites yet"
                            : showingQueue
                            ? "Your queue is empty"
                            : "No music found"
                    }
                </strong>

                <span>
                    ${
                        showingFavorites
                            ? "Tap ♥ on a song to save it."
                            : showingQueue
                            ? "Add songs to your queue."
                            : "Add an MP3 or try another search."
                    }
                </span>

            </div>

        `;

        return;

    }


    visible.forEach(
        function(song, position) {

            const realIndex =
                songs.indexOf(song);


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "song-item";


            item.dataset.id =
                song.id;


            const number =
                document.createElement(
                    "div"
                );


            number.className =
                "song-number";


            number.textContent =
                position + 1;


            const cover =
                document.createElement(
                    "div"
                );


            cover.className =
                "song-cover";


            cover.textContent =
                "♪";


            setCover(
                cover,
                song
            );


            const info =
                document.createElement(
                    "div"
                );


            info.className =
                "song-info";


            info.innerHTML = `
                <h3>
                    ${escapeHTML(song.title)}
                </h3>

                <p>
                    ${escapeHTML(song.artist)}
                </p>
            `;


            const songTime =
                document.createElement(
                    "span"
                );


            songTime.className =
                "song-duration";


            songTime.textContent =
                song.duration
                    ? formatTime(
                        song.duration
                    )
                    : "--:--";


            const play =
                document.createElement(
                    "button"
                );


            play.className =
                "song-play";


            play.textContent =
                realIndex === currentIndex &&
                !audio.paused
                    ? "Ⅱ"
                    : "▶";


            item.appendChild(number);

            item.appendChild(cover);

            item.appendChild(info);

            item.appendChild(songTime);

            item.appendChild(play);


            item.addEventListener(
                "click",
                function() {

                    loadSong(realIndex);

                    playSong();

                }
            );


            playlist.appendChild(item);

        }
    );


    updateActiveSong();

}


// ================================
// ACTIVE SONG
// ================================

function updateActiveSong() {

    document
        .querySelectorAll(
            ".song-item"
        )
        .forEach(
            item => {

                item.classList.toggle(
                    "active",
                    item.dataset.id ===
                    songs[currentIndex]?.id
                );

            }
        );

}


// ================================
// ADD MUSIC
// ================================

function openMusicPicker() {

    musicInput.click();

}


addMusicBtn.addEventListener(
    "click",
    openMusicPicker
);

addSmallBtn.addEventListener(
    "click",
    openMusicPicker
);


// ================================
// FILE UPLOAD
// ================================

musicInput.addEventListener(
    "change",
    function() {

        const files =
            Array.from(
                musicInput.files
            );


        if (
            files.length === 0
        ) {
            return;
        }


        if (
            songs.length === 1 &&
            songs[0].id === "welcome"
        ) {

            songs = [];

        }


        files.forEach(
            function(file) {

                const id =
                    Date.now() +
                    "-" +
                    Math.random()
                        .toString(36)
                        .slice(2);


                songs.push({

                    id: id,

                    title:
                        file.name
                            .replace(
                                /\.[^/.]+$/,
                                ""
                            ),

                    artist:
                        "Local Music",

                    src:
                        URL.createObjectURL(
                            file
                        ),

                    duration: 0

                });

            }
        );


        renderPlaylist();


        if (
            currentIndex === -1
        ) {

            loadSong(0);

        }


        musicInput.value = "";

    }
);


// ================================
// HOME
// ================================

homeBtn.addEventListener(
    "click",
    function() {

        showingFavorites = false;

        showingQueue = false;

        searchInput.value = "";


        setNavigation(
            homeBtn
        );


        renderPlaylist();

    }
);


// ================================
// FAVORITES
// ================================

favoritesBtn.addEventListener(
    "click",
    function() {

        showingFavorites = true;

        showingQueue = false;


        setNavigation(
            favoritesBtn
        );


        renderPlaylist();

    }
);


// ================================
// QUEUE
// ================================

queueBtn.addEventListener(
    "click",
    function() {

        showingQueue = true;

        showingFavorites = false;


        setNavigation(
            queueBtn
        );


        renderPlaylist();

    }
);


function setNavigation(active) {

    document
        .querySelectorAll(
            ".nav-item"
        )
        .forEach(
            button =>
                button.classList.remove(
                    "active"
                )
        );


    active.classList.add(
        "active"
    );

}


// ================================
// ADD CURRENT SONG TO QUEUE
// ================================

document.addEventListener(
    "dblclick",
    function(event) {

        const item =
            event.target.closest(
                ".song-item"
            );


        if (!item) {
            return;
        }


        const id =
            item.dataset.id;


        if (
            id &&
            !queue.includes(id)
        ) {

            queue.push(id);

            alert(
                "Song added to queue!"
            );

        }

    }
);


// ================================
// KEYBOARD
// ================================

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.target.tagName ===
            "INPUT"
        ) {
            return;
        }


        if (
            event.code === "Space"
        ) {

            event.preventDefault();

            togglePlay();

        }


        if (
            event.code ===
            "ArrowRight"
        ) {

            nextSong();

        }


        if (
            event.code ===
            "ArrowLeft"
        ) {

            prevBtn.click();

        }

    }
);


// ================================
// ESCAPE HTML
// ================================

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value;


    return div.innerHTML;

}


// ================================
// SERVICE WORKER
// ================================

if (
    "serviceWorker" in navigator
) {

    window.addEventListener(
        "load",
        function() {

            navigator.serviceWorker
                .register(
                    "./sw.js"
                )
                .catch(
                    error =>
                        console.log(
                            "PWA:",
                            error
                        )
                );

        }
    );

}


// ================================
// START
// ================================

loadSong(0);

renderPlaylist();

updateVolumeIcon();