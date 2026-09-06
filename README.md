# Arvind Yadav portfolio

Static site. No build step: open `index.html` in a browser, or drop the whole `site` folder on Netlify, Vercel, GitHub Pages or Lovable.

## Folders

- `index.html` — all the copy lives here.
- `assets/css/style.css` — colours, type and layout. Palette and spacing are variables at the top.
- `assets/js/main.js` — hero reel timecode, mute toggle, hover previews, and the lightbox player.
- `assets/video/` — the clips (MP4, H.264, faststart). Reels are 9:16; the podcast teaser is 16:9.
- `assets/poster/` — the still shown before each clip plays.

## Clips

| File | Shown as | From |
| --- | --- | --- |
| storytelling-reel.mp4 | Hero reel and first grid item | new |
| podcast-teaser.mp4 | Podcast teaser, widescreen lead | new |
| reel-02.mp4 | Podcast story | new (was 02.mp4) |
| content-creator.mp4 | Content creator | old portfolio |
| talking-head.mp4 | Talking head | old portfolio, 1080p source brought to 720p |
| ai-tools-reel.mp4 | 15 best AI tools | new |
| guest.mp4 | Guest feature | old portfolio |
| jump-cuts.mp4 | Jump cut strategies | old portfolio |
| tata-final.mp4 | TATA, final cut | old portfolio, 1080p source brought to 720p |

The old portfolio's five YouTube shorts were the same five clips as above, so they are not duplicated here.

## How the work section behaves

- Hovering a piece plays it silently. Moving away resets it.
- Clicking a piece, or the hero reel, opens it in a lightbox with sound and native controls. Esc, the Close button, or a click on the backdrop closes it.
- On touch devices there is no hover; a tap opens the lightbox.

## Replacing a video

1. Export as MP4 (H.264 + AAC). Keep the aspect ratio: 9:16 for reels, 16:9 for the widescreen lead.
2. Drop it into `assets/video/` and point the matching `<source src="...">` in `index.html` at it.
3. Make a poster still, for example:

   ffmpeg -ss 3 -i assets/video/new-clip.mp4 -frames:v 1 -vf scale=540:-2 -q:v 3 assets/poster/new-clip.jpg

4. Update the title (also the `data-title` on the player), description and duration in that piece.

The hero reel (top of the page) is `storytelling-reel.mp4`. If you swap it for a clip with a different frame rate, change `HERO_FPS` in `main.js` so the timecode readout stays honest.
