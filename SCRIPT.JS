// ========================================
// MLVC PLAYLIST
// BLACK • GRAY • BLUE
// ========================================


// ========================================
// ELEMENTS
// ========================================

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

const editCurrentBtn =
    document.getElementById("editCurrentBtn");

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

const coverInput =
    document.getElementById("coverInput");

const addMusicBtn =
    document.getElementById("addMusicBtn");

const addSmallBtn =
    document.getElementById("addSmallBtn");

const addCoverBtn =
    document.getElementById("addCoverBtn");

const homeBtn =
    document.getElementById("homeBtn");

const favoritesBtn =
    document.getElementById("favoritesBtn");

const recentBtn =
    document.getElementById("recentBtn");

const queueBtn =
    document.getElementById("queueBtn");

const mobileTitle =
    document.getElementById("mobileTitle");

const mobileArtist =
    document.getElementById("mobileArtist");

const mobileCover =
    document.getElementById("mobileCover");

const editModal =
    document.getElementById("editModal");

const closeModal =
    document.getElementById("closeModal");

const cancelEdit =
    document.getElementById("cancelEdit");

const saveEdit =
    document.getElementById("saveEdit");

const editTitle =
    document.getElementById("editTitle");

const editArtist =
    document.getElementById("editArtist");


// ========================================
// STATE
// ========================================

let songs = [];

let currentIndex = -1;

let shuffleMode = false;

let repeatMode = false;

let showingFavorites = false;

let showingRecent = false;

let showingQueue = false;

let favorites = [];

let recentlyPlayed = [];

let queue = [];

let editingId = null;

let previousVolume = 0.8;


// ========================================
// DATABASE
// ========================================

let database;

const DB_NAME =
    "MelvicMusicDatabase";

const DB_VERSION = 1;

const STORE =
    "songs";


function openDatabase() {

    return new Promise(
        (resolve, reject) => {

            const request =
                indexedDB.open(
                    DB_NAME,
                    DB_VERSION
                );


            request.onupgradeneeded =
                function(event) {

                    const db =
                        event.target.result;

                    if (
                        !db.objectStoreNames
                            .contains(STORE)
                    ) {

                        db.createObjectStore(
                            STORE,
                            {
                                keyPath: "id"
                            }
                        );

                    }

                };


            request.onsuccess =
                function(event) {

                    database =
                        event.target.result;

                    resolve(database);

                };


            request.onerror =
                function() {

                    reject(
                        request.error
                    );

                };

        }
    );

}


// ========================================
// DATABASE HELPERS
// ========================================

function saveSong(song) {

    return new Promise(
        (resolve, reject) => {

            const transaction =
                database.transaction(
                    STORE,
                    "readwrite"
                );

            const store =
                transaction.objectStore(
                    STORE
                );

            const request =
                store.put(song);


            request.onsuccess =
                () => resolve();

            request.onerror =
                () => reject(
                    request.error
                );

        }
    );

}


function deleteSongFromDatabase(id) {

    return new Promise(
        (resolve, reject) => {

            const transaction =
                database.transaction(
                    STORE,
                    "readwrite"
                );

            const store =
                transaction.objectStore(
                    STORE
                );

            const request =
                store.delete(id);


            request.onsuccess =
                () => resolve();

            request.onerror =
                () => reject(
                    request.error
                );

        }
    );

}


function getAllSongs() {

    return new Promise(
        (resolve, reject) => {

            const transaction =
                database.transaction(
                    STORE,
                    "readonly"
                );

            const store =
                transaction.objectStore(
                    STORE
                );

            const request =
                store.getAll();


            request.onsuccess =
                () => resolve(
                    request.result
                );

            request.onerror =
                () => reject(
                    request.error
                );

        }
    );

}


// ========================================
// LOCAL STORAGE
// ========================================

function loadSettings() {

    try {

        favorites =
            JSON.parse(
                localStorage.getItem(
                    "melvicFavorites"
                )
            ) || [];


        recentlyPlayed =
            JSON.parse(
                localStorage.getItem(
                    "melvicRecent"
                )
            ) || [];


        const savedVolume =
            localStorage.getItem(
                "melvicVolume"
            );


        if (
            savedVolume !== null
        ) {

            volume.value =
                savedVolume;

            audio.volume =
                Number(savedVolume);

            previousVolume =
                Number(savedVolume);

        } else {

            audio.volume =
                0.8;

        }

    } catch {

        favorites = [];

        recentlyPlayed = [];

        audio.volume = 0.8;

    }

}


function saveSettings() {

    localStorage.setItem(
        "melvicFavorites",
        JSON.stringify(
            favorites
        )
    );


    localStorage.setItem(
        "melvicRecent",
        JSON.stringify(
            recentlyPlayed
        )
    );

}


// ========================================
// UTILITIES
// ========================================

function formatTime(seconds) {

    if (
        !Number.isFinite(seconds) ||
        seconds < 0
    ) {

        return "0:00";

    }

    const mins =
        Math.floor(
            seconds / 60
        );

    const secs =
        Math.floor(
            seconds % 60
        );

    return (
        mins +
        ":" +
        String(secs)
            .padStart(2, "0")
    );

}


function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        value;

    return div.innerHTML;

}


function generateID() {

    return (
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .slice(2)
    );

}


// ========================================
// COVER
// ========================================

function setCover(element, song) {

    if (!element) {
        return;
    }


    element.innerHTML = "";


    if (
        song &&
        song.cover
    ) {

        const image =
            document.createElement(
                "img"
            );

        image.src =
            song.cover;

        image.alt =
            song.title;

        element.appendChild(
            image
        );

        return;

    }


    const note =
        document.createElement(
            "span"
        );

    note.textContent =
        "♪";

    element.appendChild(
        note
    );


    const number =
        (song?.title || "Melvic")
            .split("")
            .reduce(
                (sum, char) =>
                    sum +
                    char.charCodeAt(0),
                0
            );


    const rotation =
        number % 360;


    element.style.background =
        `linear-gradient(
            ${rotation}deg,
            #3185ff,
            #172b49 50%,
            #0b0e13
        )`;

}


// ========================================
// LOAD SONG
// ========================================

function loadSong(index) {

    if (
        index < 0 ||
        index >= songs.length
    ) {
        return;
    }


    currentIndex =
        index;


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


    if (
        song.url
    ) {

        audio.src =
            song.url;

    } else {

        audio.removeAttribute(
            "src"
        );

        audio.load();

    }


    progress.value =
        0;

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


// ========================================
// PLAY
// ========================================

async function playSong() {

    if (
        currentIndex < 0
    ) {

        return;

    }


    const song =
        songs[currentIndex];


    if (
        !song ||
        !song.url
    ) {

        return;

    }


    addToRecentlyPlayed(
        song.id
    );


    try {

        await audio.play();

    } catch(error) {

        console.log(
            "Playback error:",
            error
        );

    }

}


// ========================================
// TOGGLE PLAY
// ========================================

function togglePlay() {

    if (
        !audio.src
    ) {

        if (
            songs.length > 0
        ) {

            loadSong(0);

            playSong();

        }

        return;

    }


    if (
        audio.paused
    ) {

        playSong();

    } else {

        audio.pause();

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


// ========================================
// NEXT
// ========================================

function nextSong() {

    if (
        songs.length === 0
    ) {
        return;
    }


    let nextIndex;


    if (
        queue.length > 0
    ) {

        const id =
            queue.shift();


        const found =
            songs.findIndex(
                song =>
                    song.id === id
            );


        if (
            found !== -1
        ) {

            nextIndex =
                found;

        }

    }


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
            nextIndex ===
            currentIndex
        );

    }


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


    loadSong(
        nextIndex
    );

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


// ========================================
// PREVIOUS
// ========================================

prevBtn.addEventListener(
    "click",
    function() {

        if (
            audio.currentTime > 3
        ) {

            audio.currentTime =
                0;

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


        loadSong(
            previous
        );

        playSong();

    }
);


// ========================================
// ENDED
// ========================================

audio.addEventListener(
    "ended",
    function() {

        if (
            repeatMode
        ) {

            audio.currentTime =
                0;

            playSong();

        } else {

            nextSong();

        }

    }
);


// ========================================
// PLAY STATE
// ========================================

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


// ========================================
// TIME
// ========================================

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
            ) *
            100;


        currentTime.textContent =
            formatTime(
                audio.currentTime
            );

    }
);


audio.addEventListener(
    "loadedmetadata",
    async function() {

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


            await saveSong(
                songs[currentIndex]
            );

        }


        renderPlaylist();

    }
);


// ========================================
// SEEK
// ========================================

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
                Number(
                    progress.value
                ) / 100
            ) *
            audio.duration;

    }
);


// ========================================
// VOLUME
// ========================================

volume.addEventListener(
    "input",
    function() {

        audio.volume =
            Number(
                volume.value
            );


        previousVolume =
            audio.volume;


        localStorage.setItem(
            "melvicVolume",
            volume.value
        );


        updateVolumeIcon();

    }
);


// ========================================
// MUTE
// ========================================

muteBtn.addEventListener(
    "click",
    function() {

        if (
            audio.volume > 0
        ) {

            previousVolume =
                audio.volume;

            audio.volume = 0;

            volume.value = 0;

        } else {

            audio.volume =
                previousVolume || 0.8;

            volume.value =
                audio.volume;

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
        audio.volume < .5
    ) {

        muteBtn.textContent =
            "🔉";

    } else {

        muteBtn.textContent =
            "🔊";

    }

}


// ========================================
// SHUFFLE
// ========================================

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


// ========================================
// REPEAT
// ========================================

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


// ========================================
// FAVORITES
// ========================================

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
                    item =>
                        item !== id
                );

        } else {

            favorites.push(id);

        }


        saveSettings();

        updateFavorite();

        renderPlaylist();

    }
);


function updateFavorite() {

    if (
        currentIndex < 0
    ) {

        favoriteBtn.textContent =
            "♡";

        return;

    }


    const id =
        songs[currentIndex].id;


    const liked =
        favorites.includes(id);


    favoriteBtn.textContent =
        liked
            ? "♥"
            : "♡";


    favoriteBtn.classList.toggle(
        "liked",
        liked
    );

}


// ========================================
// RECENTLY PLAYED
// ========================================

function addToRecentlyPlayed(id) {

    recentlyPlayed =
        recentlyPlayed.filter(
            item =>
                item !== id
        );


    recentlyPlayed.unshift(
        id
    );


    recentlyPlayed =
        recentlyPlayed.slice(
            0,
            30
        );


    saveSettings();

}


// ========================================
// VISIBLE SONGS
// ========================================

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
        showingRecent
    ) {

        visible =
            recentlyPlayed
                .map(
                    id =>
                        songs.find(
                            song =>
                                song.id === id
                        )
                )
                .filter(Boolean);

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


// ========================================
// RENDER
// ========================================

function renderPlaylist() {

    const visible =
        getVisibleSongs();


    playlist.innerHTML =
        "";


    if (
        showingFavorites
    ) {

        playlistTitle.textContent =
            "Favorites";

    } else if (
        showingRecent
    ) {

        playlistTitle.textContent =
            "Recently Played";

    } else if (
        showingQueue
    ) {

        playlistTitle.textContent =
            "Queue";

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
                            : showingRecent
                            ? "Nothing played yet"
                            : showingQueue
                            ? "Queue is empty"
                            : "No music found"
                    }
                </strong>

                <span>
                    ${
                        showingFavorites
                            ? "Favorite a song to see it here."
                            : showingRecent
                            ? "Play a song and it will appear here."
                            : showingQueue
                            ? "Double-click a song to add it."
                            : "Add your music to get started."
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


            if (
                realIndex ===
                currentIndex
            ) {

                item.classList.add(
                    "active"
                );

            }


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
                    ${escapeHTML(
                        song.title
                    )}
                </h3>

                <p>
                    ${escapeHTML(
                        song.artist
                    )}
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


            const queueButton =
                document.createElement(
                    "button"
                );


            queueButton.className =
                "song-action";


            queueButton.textContent =
                "＋";


            queueButton.title =
                "Add to queue";


            queueButton.addEventListener(
                "click",
                function(event) {

                    event.stopPropagation();

                    addToQueue(
                        song.id
                    );

                }
            );


            const deleteButton =
                document.createElement(
                    "button"
                );


            deleteButton.className =
                "song-action delete-action";


            deleteButton.textContent =
                "×";


            deleteButton.title =
                "Delete";


            deleteButton.addEventListener(
                "click",
                async function(event) {

                    event.stopPropagation();

                    await removeSong(
                        song.id
                    );

                }
            );


            item.appendChild(
                number
            );

            item.appendChild(
                cover
            );

            item.appendChild(
                info
            );

            item.appendChild(
                songTime
            );

            item.appendChild(
                queueButton
            );

            item.appendChild(
                deleteButton
            );


            item.addEventListener(
                "click",
                function() {

                    loadSong(
                        realIndex
                    );

                    playSong();

                }
            );


            playlist.appendChild(
                item
            );

        }
    );

}


// ========================================
// ADD TO QUEUE
// ========================================

function addToQueue(id) {

    if (
        !queue.includes(id)
    ) {

        queue.push(id);

        renderPlaylist();

    }

}


// ========================================
// REMOVE SONG
// ========================================

async function removeSong(id) {

    const index =
        songs.findIndex(
            song =>
                song.id === id
        );


    if (
        index === -1
    ) {
        return;
    }


    const confirmed =
        confirm(
            "Delete this song from your library?"
        );


    if (
        !confirmed
    ) {
        return;
    }


    if (
        index === currentIndex
    ) {

        audio.pause();

        audio.removeAttribute(
            "src"
        );

    }


    if (
        index < currentIndex
    ) {

        currentIndex--;

    }


    songs.splice(
        index,
        1
    );


    favorites =
        favorites.filter(
            item =>
                item !== id
        );


    recentlyPlayed =
        recentlyPlayed.filter(
            item =>
                item !== id
        );


    queue =
        queue.filter(
            item =>
                item !== id
        );


    await deleteSongFromDatabase(
        id
    );


    saveSettings();


    if (
        songs.length === 0
    ) {

        currentIndex = -1;

        songTitle.textContent =
            "Welcome to MLVC Playlist";

        songArtist.textContent =
            "Add your music to begin";

        albumCover.innerHTML =
            "<span>♪</span>";

        mobileTitle.textContent =
            "Nothing playing";

        mobileArtist.textContent =
            "—";

    } else if (
        currentIndex >= songs.length
    ) {

        currentIndex =
            songs.length - 1;

    }


    renderPlaylist();

}


// ========================================
// ADD MUSIC
// ========================================

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


// ========================================
// IMPORT MUSIC
// ========================================

musicInput.addEventListener(
    "change",
    async function() {

        const files =
            Array.from(
                musicInput.files
            );


        for (
            const file of files
        ) {

            const id =
                generateID();


            const url =
                URL.createObjectURL(
                    file
                );


            const song = {

                id: id,

                title:
                    file.name
                        .replace(
                            /\.[^/.]+$/,
                            ""
                        ),

                artist:
                    "Local Music",

                type:
                    file.type,

                blob:
                    file,

                url:
                    url,

                duration:
                    0,

                cover:
                    null,

                added:
                    Date.now()

            };


            songs.push(
                song
            );


            await saveSong(
                song
            );

        }


        if (
            currentIndex === -1 &&
            songs.length > 0
        ) {

            loadSong(0);

        }


        renderPlaylist();


        musicInput.value =
            "";

    }
);


// ========================================
// ADD COVER
// ========================================

addCoverBtn.addEventListener(
    "click",
    function() {

        if (
            currentIndex < 0
        ) {

            alert(
                "Play or select a song first."
            );

            return;

        }


        coverInput.click();

    }
);


coverInput.addEventListener(
    "change",
    async function() {

        const file =
            coverInput.files[0];


        if (
            !file ||
            currentIndex < 0
        ) {

            return;

        }


        const reader =
            new FileReader();


        reader.onload =
            async function(event) {

                songs[currentIndex]
                    .cover =
                    event.target.result;


                await saveSong(
                    songs[currentIndex]
                );


                loadSong(
                    currentIndex
                );


                renderPlaylist();

            };


        reader.readAsDataURL(
            file
        );


        coverInput.value =
            "";

    }
);


// ========================================
// NAVIGATION
// ========================================

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


homeBtn.addEventListener(
    "click",
    function() {

        showingFavorites = false;

        showingRecent = false;

        showingQueue = false;

        searchInput.value =
            "";

        setNavigation(
            homeBtn
        );

        renderPlaylist();

    }
);


favoritesBtn.addEventListener(
    "click",
    function() {

        showingFavorites = true;

        showingRecent = false;

        showingQueue = false;

        setNavigation(
            favoritesBtn
        );

        renderPlaylist();

    }
);


recentBtn.addEventListener(
    "click",
    function() {

        showingFavorites = false;

        showingRecent = true;

        showingQueue = false;

        setNavigation(
            recentBtn
        );

        renderPlaylist();

    }
);


queueBtn.addEventListener(
    "click",
    function() {

        showingFavorites = false;

        showingRecent = false;

        showingQueue = true;

        setNavigation(
            queueBtn
        );

        renderPlaylist();

    }
);


// ========================================
// SEARCH
// ========================================

searchInput.addEventListener(
    "input",
    function() {

        renderPlaylist();

    }
);


// ========================================
// DOUBLE CLICK = QUEUE
// ========================================

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


        addToQueue(
            item.dataset.id
        );

    }
);


// ========================================
// EDIT SONG
// ========================================

editCurrentBtn.addEventListener(
    "click",
    function() {

        if (
            currentIndex < 0
        ) {

            return;

        }


        const song =
            songs[currentIndex];


        editingId =
            song.id;


        editTitle.value =
            song.title;

        editArtist.value =
            song.artist;


        editModal.classList.add(
            "show"
        );

    }
);


function closeEditModal() {

    editModal.classList.remove(
        "show"
    );

    editingId =
        null;

}


closeModal.addEventListener(
    "click",
    closeEditModal
);

cancelEdit.addEventListener(
    "click",
    closeEditModal
);


saveEdit.addEventListener(
    "click",
    async function() {

        if (
            !editingId
        ) {

            return;

        }


        const song =
            songs.find(
                item =>
                    item.id ===
                    editingId
            );


        if (!song) {
            return;
        }


        const title =
            editTitle.value.trim();

        const artist =
            editArtist.value.trim();


        if (
            title
        ) {

            song.title =
                title;

        }


        if (
            artist
        ) {

            song.artist =
                artist;

        }


        await saveSong(
            song
        );


        loadSong(
            currentIndex
        );


        renderPlaylist();

        closeEditModal();

    }
);


// ========================================
// KEYBOARD
// ========================================

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
            event.code ===
            "Space"
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


        if (
            event.code ===
            "ArrowUp"
        ) {

            audio.volume =
                Math.min(
                    1,
                    audio.volume + .05
                );

            volume.value =
                audio.volume;

        }


        if (
            event.code ===
            "ArrowDown"
        ) {

            audio.volume =
                Math.max(
                    0,
                    audio.volume - .05
                );

            volume.value =
                audio.volume;

        }

    }
);


// ========================================
// INITIALIZE
// ========================================

async function initialize() {

    loadSettings();

    updateVolumeIcon();


    try {

        await openDatabase();


        const storedSongs =
            await getAllSongs();


        songs =
            storedSongs.map(
                song => {

                    if (
                        song.blob
                    ) {

                        song.url =
                            URL.createObjectURL(
                                song.blob
                            );

                    }

                    return song;

                }
            );


        if (
            songs.length > 0
        ) {

            loadSong(0);

        }


        renderPlaylist();


    } catch(error) {

        console.error(
            "Database error:",
            error
        );


        renderPlaylist();

    }

}


// ========================================
// SERVICE WORKER
// ========================================

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
                            "PWA error:",
                            error
                        )
                );

        }
    );

}


// ========================================
// START
// ========================================

initialize();