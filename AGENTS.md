# Website video defaults

Use the existing shared player (`video-player.js` and `video-player.css`) for every video added to this website. This is the user's approved default. Preserve it unless the user requests a change.

- Use a simple black control bar with white icons and gray sliders. Use a speaker icon for sound and a crossed speaker when muted, never a music note.
- Keep play/pause, seeking, mute, volume, playback speed, captions, and fullscreen directly accessible. Do not group them in an overflow menu or hide volume on small screens.
- Keep playback controls below the video image, separate from captions, including in fullscreen.
- Clicking or tapping the video image toggles play/pause. Support left/right arrow keys to seek 5 seconds and horizontal swipes or drags to seek 10 seconds, without disrupting vertical page scrolling or control widgets.
- Use transparent caption text with no background box. Review every slide and place captions in a clear blank area, preferring the bottom when it is free. Keep the existing readable sizes and a stable position within each slide. If the slide or small player has insufficient room, reserve space below the image so captions never overlap slide content. Record reviewed regions in `video-caption-layouts.js`. Use a simple CC toggle without a caption-settings submenu. For narrated videos, generate synchronized captions yourself if none are supplied, and include the CC toggle. Omit CC only for videos with no speech.
- Group caption cues into complete sentences or natural clauses, preserving narration timing. Check mathematical terminology against the paper or narration script when available. Label automatically transcribed tracks accordingly.
- Use the first slide as the poster. Keep videos compact (420px maximum width) outside fullscreen, with fullscreen and controls available before playback.
- Do not add download or picture-in-picture controls.
- Follow the markup example in README.md. Reuse the shared player rather than implementing a different player for each paper.
