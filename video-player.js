// Keep the controls outside the slide so they never cover its captions.
const speakerIcon = muted => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" style="display:block">
    <path d="M11 5 6 9H3v6h3l5 4Z"/>
    ${muted ? '<path d="m16 9 6 6m0-6-6 6"/>' : '<path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>'}
</svg>`;
document.querySelectorAll('video').forEach(video => {
    if (video.closest('.publication-player')) return;
    video.classList.add('publication-video');
    video.setAttribute('controlslist', 'nodownload');
    video.setAttribute('disablepictureinpicture', '');
    video.setAttribute('playsinline', '');
    if (!video.hasAttribute('preload')) video.preload = 'metadata';
    const player = document.createElement('div');
    player.className = 'publication-player';
    const stage = document.createElement('div');
    stage.className = 'video-stage';
    const picture = document.createElement('div');
    picture.className = 'video-picture';
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
            <button type="button" data-action="mute" aria-label="Mute">${speakerIcon(false)}</button>
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
    picture.append(video);
    stage.append(picture, captions);
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
    const sourceName = (video.querySelector('source')?.getAttribute('src') || video.getAttribute('src') || '').split('/').pop().split('?')[0];
    const slideLayouts = window.videoCaptionLayouts?.[sourceName] || [];
    let layoutFrame = 0;
    let lastLayoutKey = '';
    const positionCaptions = () => {
        layoutFrame = 0;
        if (captions.hidden && captionsEnabled) return;
        if (!captionsEnabled) {
            stage.classList.remove('has-caption-footer');
            stage.style.removeProperty('--caption-reserve');
            lastLayoutKey = '';
            return;
        }
        const scene = slideLayouts.find(s => video.currentTime >= s.start && video.currentTime < s.end);
        const inFullscreen = (document.fullscreenElement || document.webkitFullscreenElement) === player;
        const key = [scene?.slide || 'unmapped', track?.cues?.length, player.clientWidth, window.innerHeight, inFullscreen].join('|');
        if (key === lastLayoutKey) return;
        lastLayoutKey = key;
        stage.classList.remove('has-caption-footer');
        stage.style.removeProperty('--caption-reserve');
        captions.style.top = 'auto';
        captions.style.bottom = 'auto';
        // Measure every caption on this slide so its placement does not jump between sentences.
        const slideTexts = Array.from(track?.cues || [])
            .filter(cue => !scene || (cue.startTime < scene.end && cue.endTime > scene.start))
            .map(cue => cue.text);
        const measure = () => {
            const currentText = captionText.textContent;
            let height = 0;
            let overflow = false;
            for (const text of slideTexts.length ? slideTexts : [currentText]) {
                captionText.textContent = text;
                height = Math.max(height, captions.getBoundingClientRect().height);
                overflow ||= captions.scrollWidth > captions.clientWidth + 1;
            }
            captionText.textContent = currentText;
            return { height, overflow };
        };
        // Try the slide's reviewed blank areas at the user's chosen readable size.
        const width = picture.clientWidth;
        const height = picture.clientHeight;
        for (const [left, top, boxWidth, boxHeight] of scene?.regions || []) {
            captions.style.left = `${left}%`;
            captions.style.width = `${boxWidth}%`;
            const metrics = measure();
            const textHeight = metrics.height;
            const availableHeight = height * boxHeight / 100;
            if (textHeight + 8 <= availableHeight && !metrics.overflow) {
                captions.style.top = `${height * (top + boxHeight) / 100 - textHeight - 4}px`;
                captions.dataset.placement = scene.slide;
                return;
            }
        }
        // Crowded slides and narrow players get a seamless footer, not an overlay.
        // Measure at the actual fullscreen width and reserve enough vertical room.
        let reserve = 0;
        let footerWidth = width;
        let textHeight = 0;
        const controlsHeight = controls.getBoundingClientRect().height;
        for (let i = 0; i < 8; i++) {
            captions.style.left = '4%';
            captions.style.width = `${footerWidth * 0.92}px`;
            textHeight = measure().height;
            const nextReserve = Math.ceil(textHeight + 20);
            const nextWidth = inFullscreen
                ? Math.max(1, Math.min(player.clientWidth, (window.innerHeight - controlsHeight - nextReserve - 16) * 16 / 9))
                : width;
            if (nextReserve === reserve && Math.abs(nextWidth - footerWidth) < 1) break;
            reserve = nextReserve;
            footerWidth = nextWidth;
        }
        stage.style.setProperty('--caption-reserve', `${reserve}px`);
        stage.classList.add('has-caption-footer');
        captions.style.width = '92%';
        captions.style.top = 'auto';
        captions.style.bottom = '10px';
        captions.dataset.placement = 'footer';
    };
    const queueCaptionLayout = () => {
        if (!layoutFrame) layoutFrame = requestAnimationFrame(positionCaptions);
    };
    new ResizeObserver(queueCaptionLayout).observe(player);
    window.addEventListener('resize', queueCaptionLayout);
    const updateCaptions = () => {
        const text = track ? Array.from(track.activeCues || []).map(cue => cue.text).join(' ') : '';
        captionText.textContent = text;
        captions.hidden = !captionsEnabled || !text;
        queueCaptionLayout();
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
        button('mute').innerHTML = speakerIcon(muted);
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
    const updateFullscreen = () => {
        button('fullscreen').setAttribute('aria-label', fullscreenElement() === player ? 'Exit fullscreen' : 'Enter fullscreen');
        lastLayoutKey = '';
        queueCaptionLayout();
    };
    document.addEventListener('fullscreenchange', updateFullscreen);
    document.addEventListener('webkitfullscreenchange', updateFullscreen);
    updateTime();
    updatePlay();
    updateVolume();
});
