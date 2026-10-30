# Shi Feng's website

The site is served by GitHub Pages from `main`. Its page is `index.html`.

## Adding a video

Every `<video>` on a page that loads `video-player.js` automatically uses the shared player. No special video class is required. The default has a black control bar, individually visible controls, a CC toggle, and transparent captions placed in reviewed blank areas of each slide. When there is not enough room, captions use space below the image, above the separate controls, in both compact and fullscreen views.

1. Put the video, a poster showing its first slide, and synchronized WebVTT captions in `videos/`.
2. Add the following markup to the appropriate paper block in `index.html`, replacing the filenames and description:

```html
<p class="publication-video-label">Video explanation</p>
<video controls playsinline preload="metadata"
       poster="videos/paper-poster.jpg"
       aria-label="Video explanation of the paper">
    <source src="videos/paper.mp4" type="video/mp4">
    <track kind="captions" src="videos/paper-en.vtt"
           srclang="en" label="English">
    Your browser does not support embedded video.
</video>
```

For every narrated video, include captions. If no synchronized caption file is supplied, transcribe the final video and create one; do not omit captions just because they were not provided. Check names and mathematical terms against the narration script or paper when available, and label automatically transcribed tracks `English (auto-generated)`. Omit the `<track>` only for videos with no speech. Prepare captions as complete sentences or natural clauses, rather than many short fragments. Review every fully revealed slide and any animations, then add its time range and blank caption regions to `video-caption-layouts.js`, keyed by video filename. Each region is `[left, top, width, height]` in image percentages. Use an empty regions list for crowded slides. The player measures all captions on each slide at the current screen size, keeps their position stable, and uses a separate footer whenever none of the reviewed regions fits. Videos without a layout map also use this safe footer. Caption text has no background box. WebVTT cue times determine synchronization.

`index.html` already loads `video-player.css`, `video-caption-layouts.js`, and `video-player.js`. Include all three on any new HTML page containing videos, with the layout map loaded before the player script. The script initializes videos present when the page loads and automatically applies the shared styling, inline playback, and download/PiP control restrictions. Native `controls` provide a fallback when JavaScript is unavailable.

When changing the shared player files, increment the corresponding `?v=` value in the page to refresh cached assets. Preview compact and fullscreen playback, captions, and controls before publishing.
