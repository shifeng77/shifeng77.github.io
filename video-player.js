// Keep the controls outside the slide so they never cover its captions.
document.querySelectorAll('.publication-video').forEach(video => {
    const player = document.createElement('div');
    player.className = 'publication-player';
    const stage = document.createElement('div');
    stage.className = 'video-stage';
    const captions = document.createElement('div');
    captions.className = 'video-captions';
    captions.hidden = true;
    const captionText = document.createElement('span');
    captions.append(captionText);
    const controls = document.createElement('div');
    controls.className = 'video-controls';
    controls.innerHTML = `
        <input class="video-seek" type="range" min="0" max="0" value="0" step="0.1" aria-label="Video position">
        <div class="video-toolbar">
            <button type="button" data-action="play" aria-label="Play">▶</button>
            <span class="video-time">0:00 / 0:00</span>
            <button type="button" data-action="mute" aria-label="Mute">♪</button>
            <input class="video-volume" type="range" min="0" max="1" step="0.05" value="1" aria-label="Volume">
            <select aria-label="Playback speed">
                <option value="0.75">0.75×</option><option value="1" selected>1×</option>
                <option value="1.25">1.25×</option><option value="1.5">1.5×</option><option value="2">2×</option>
            </select>
            <button type="button" data-action="captions" aria-label="Captions" aria-pressed="false">CC</button>
            <button type="button" data-action="fullscreen" aria-label="Enter fullscreen">⛶</button>
        </div>`;
    const error = document.createElement('p');
    error.className = 'video-error';
    error.setAttribute('role', 'status');
    error.hidden = true;
    video.before(player);
    stage.append(video, captions);
    player.append(stage, controls, error);
    video.controls = false;

    const button = name => controls.querySelector(`[data-action="${name}"]`);
    const seek = controls.querySelector('.video-seek');
    const volume = controls.querySelector('.video-volume');
    const time = controls.querySelector('.video-time');
    const trackElement = video.querySelector('track');
    const track = trackElement?.track;
    let captionsEnabled = false;
    const format = value => {
        const seconds = Math.floor(Number.isFinite(value) ? value : 0);
        return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
    };
    const report = message => { error.textContent = message; error.hidden = false; };
    const updateCaptions = () => {
        const text = track ? Array.from(track.activeCues || []).map(cue => cue.text).join(' ') : '';
        captionText.textContent = text;
        captions.hidden = !captionsEnabled || !text;
    };
    if (track) {
        // Hidden tracks load and track cue timing without the native captions/settings menu.
        track.mode = 'hidden';
        track.addEventListener('cuechange', updateCaptions);
        trackElement.addEventListener('load', updateCaptions);
        trackElement.addEventListener('error', () => {
            if (captionsEnabled) report('Captions could not load. Please refresh the page.');
        });
    } else button('captions').hidden = true;
    button('captions').addEventListener('click', () => {
        captionsEnabled = !captionsEnabled;
        button('captions').setAttribute('aria-pressed', String(captionsEnabled));
        if (captionsEnabled && trackElement.readyState === 3) report('Captions could not load. Please refresh the page.');
        updateCaptions();
    });
    const updateTime = () => {
        seek.max = Number.isFinite(video.duration) ? video.duration : 0;
        seek.value = video.currentTime;
        seek.setAttribute('aria-valuetext', `${format(video.currentTime)} of ${format(video.duration)}`);
        time.textContent = `${format(video.currentTime)} / ${format(video.duration)}`;
        updateCaptions();
    };
    ['loadedmetadata', 'durationchange', 'timeupdate', 'seeked'].forEach(event => video.addEventListener(event, updateTime));
    seek.addEventListener('input', () => { video.currentTime = Number(seek.value); updateTime(); });
    button('play').addEventListener('click', async () => {
        if (video.paused) {
            try { await video.play(); error.hidden = true; }
            catch { report('Video could not play. Please try again.'); }
        } else video.pause();
    });
    const updatePlay = () => {
        button('play').textContent = video.paused ? '▶' : 'Ⅱ';
        button('play').setAttribute('aria-label', video.paused ? 'Play' : 'Pause');
    };
    ['play', 'pause', 'ended'].forEach(event => video.addEventListener(event, updatePlay));
    const updateVolume = () => {
        const muted = video.muted || video.volume === 0;
        button('mute').textContent = muted ? '×♪' : '♪';
        button('mute').setAttribute('aria-label', muted ? 'Unmute' : 'Mute');
        volume.value = video.muted ? 0 : video.volume;
    };
    button('mute').addEventListener('click', () => {
        if (video.muted || video.volume === 0) {
            if (video.volume === 0) video.volume = 1;
            video.muted = false;
        } else video.muted = true;
    });
    volume.addEventListener('input', () => { video.volume = Number(volume.value); video.muted = video.volume === 0; });
    video.addEventListener('volumechange', updateVolume);
    controls.querySelector('select').addEventListener('change', event => { video.playbackRate = Number(event.target.value); });
    const fullscreenElement = () => document.fullscreenElement || document.webkitFullscreenElement;
    button('fullscreen').addEventListener('click', async () => {
        try {
            if (fullscreenElement()) {
                if (document.exitFullscreen) await document.exitFullscreen();
                else document.webkitExitFullscreen?.();
            }
            else if (player.requestFullscreen) await player.requestFullscreen();
            else if (player.webkitRequestFullscreen) player.webkitRequestFullscreen();
            else report('Fullscreen is not available in this browser.');
        } catch { report('Fullscreen could not open. Please try again.'); }
    });
    const updateFullscreen = () => button('fullscreen').setAttribute('aria-label', fullscreenElement() === player ? 'Exit fullscreen' : 'Enter fullscreen');
    document.addEventListener('fullscreenchange', updateFullscreen);
    document.addEventListener('webkitfullscreenchange', updateFullscreen);
    updateTime();
    updatePlay();
    updateVolume();
});
