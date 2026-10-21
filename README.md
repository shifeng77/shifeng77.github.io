# Shi Feng's website

The site is served by GitHub Pages from `main`. Its page is `index.html`.

## Adding a video

Every `<video>` on a page that loads `video-player.js` automatically uses the shared player. No special video class is required. The default has a black control bar, individually visible controls, a CC toggle, and captions at the bottom of the slide image, above the separate controls in both compact and fullscreen views.

1. Put the video, a poster showing its first slide, and any WebVTT captions in `videos/`.
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

Omit the `<track>` if captions are not available. Prepare captions as complete sentences or natural clauses, rather than many short fragments. The shared player controls their visual placement; WebVTT cue times determine synchronization.

`index.html` already loads `video-player.css` and `video-player.js`. Include both on any new HTML page containing videos. The script initializes videos present when the page loads and automatically applies the shared styling, inline playback, and download/PiP control restrictions. Native `controls` provide a fallback when JavaScript is unavailable.

When changing the shared player files, increment the corresponding `?v=` value in the page to refresh cached assets. Preview compact and fullscreen playback, captions, and controls before publishing.
