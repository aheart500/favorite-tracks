const baseURL = "https://favoritetrackss.herokuapp.com/songs/";
const playButton = document.querySelector("#playButton");
const track = document.querySelector("#track");
const loading = document.querySelector("#loading");
const volumeRange = document.querySelector("#volumeRange");
const downloadLink = document.querySelector("#download-link");
let selectedSong;
let audio;
const volumeContainerIcon = document.querySelector(".volume-container");
const indicators = {
    elapsed: document.querySelector("#elapsed"),
    remaining: document.querySelector("#remaining"),
    duration: document.querySelector("#duration"),
};
const setTimers = (type, time) => {
    const formatTime = (n) => {
        let minutes = ~~((n % 3600) / 60);
        let remainingOfSeconds = ~~n % 60;
        let secondsRendered = remainingOfSeconds < 10 ? "0" + remainingOfSeconds : remainingOfSeconds;
        return minutes < 10
            ? "0" + `${minutes}:${secondsRendered}`
            : `${minutes}:${secondsRendered}`;
    };
    let timeRounded = Math.round(time);
    if (type === "duration")
        indicators.duration.textContent = formatTime(timeRounded);
    if (type === "elapsed") {
        let remaining = audio.duration - time;
        indicators.elapsed.textContent = formatTime(timeRounded);
        if (indicators.remaining) {
            indicators.remaining.textContent = isNaN(remaining)
                ? "0"
                : formatTime(Math.round(remaining));
        }
    }
};
let AudioCtx;
let gainNode;
const changeVolume = (e) => {
    const value = e.target.value;
    if (gainNode) {
        gainNode.gain.setValueAtTime(value, 0);
    }
    if (value > 1.4) {
        volumeContainerIcon.style.background =
            "url(./icons/volume-high.svg) no-repeat center";
    }
    else if (value == 0) {
        volumeContainerIcon.style.background =
            "url(./icons/volume-silent.svg) no-repeat center";
    }
    else {
        volumeContainerIcon.style.background =
            "url(./icons/volume-low.svg) no-repeat center";
    }
};
const changeSongSrc = (url) => {
    if (!AudioCtx) {
        AudioCtx = new AudioContext();
        gainNode = AudioCtx.createGain();
        gainNode.gain.setValueAtTime(Number(volumeRange.value), 0);
    }
    if (audio)
        audio.pause();
    audio = new Audio(url);
    audio.crossOrigin = "anonymous";
    const source = AudioCtx.createMediaElementSource(audio);
    source.connect(gainNode).connect(AudioCtx.destination);
    audio.play();
    audio.addEventListener("play", () => {
        if (AudioCtx.state === "suspended") {
            AudioCtx.resume();
        }
        track.value = `0`;
    });
    audio.addEventListener("timeupdate", () => {
        track.value = `${audio.currentTime}`;
        setTimers("elapsed", audio.currentTime);
    });
    audio.addEventListener("playing", () => {
        if (track.max !== `${audio.duration}`)
            track.max = `${audio.duration}`;
        setTimers("duration", audio.duration);
        downloadLink.href = url;
        downloadLink.download = selectedSong.title;
        downloadLink.style.display = "flex";
    });
    audio.addEventListener("ended", () => {
        audio.pause();
        playButton.style.background = "url(./icons/start.svg) no-repeat center";
    });
    playButton.disabled = false;
    playButton.style.background = "url(./icons/stop.svg) no-repeat center";
};
const play = () => {
    if (audio.currentTime === audio.duration) {
        audio.play();
        playButton.style.background = "url(./icons/stop.svg) no-repeat center";
        return;
    }
    if (AudioCtx.state === "suspended") {
        AudioCtx.resume();
        playButton.style.background = "url(./icons/stop.svg) no-repeat center";
    }
    else {
        AudioCtx.suspend();
        playButton.style.background = "url(./icons/start.svg) no-repeat center";
    }
};
const changeTrackTime = (e) => {
    if (audio)
        audio.currentTime = e.target.value;
    if (volumeHoverBox.classList.contains("show-box")) {
        hideVolumeBox();
    }
};
const fetchSong = (id) => {
    loading.style.display = "block";
    downloadLink.style.display = "none";
    indicators.duration.textContent = "00:00";
    indicators.elapsed.textContent = "00:00";
    playButton.disabled = true;
    if (AudioCtx)
        AudioCtx.suspend();
    fetch("https://favoritetrackss.herokuapp.com/ping/", {
        method: "POST",
        body: JSON.stringify({ id }),
        headers: { "Content-Type": "application/json" },
    })
        .then((res) => res.text())
        .then((res) => {
        changeSongSrc(baseURL + res);
        loading.style.display = "none";
    })
        .catch((err) => console.log(err));
};
//# sourceMappingURL=script.js.map