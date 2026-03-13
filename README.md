# Super Apoorve Bros - Interactive Resume

A Mario-style (Elden Ring Audio theme based) interactive Resume built with pure HTML5 Canvas and vanilla JavaScript.  
No heavy libraries, no build step, fully static and GitHub Pages friendly.

## Features

- 3 company levels:
  - Saarthi.ai
  - Regeneron
  - Tailored AI
- Project enemies reveal project details when defeated
- Tech-stack collectibles as coins
- Checkpoint-like continue behavior:
  - If lives reach zero, player resumes from the same stage (level or boss)
- Final boss level for Technical Skills:
  - multi-phase boss health bar
  - harder phase mechanics with movement and projectile patterns
- Cheat console (`~`) with command `escape`:
  - toggles invincibility on/off
  - rainbow player glow while active
  - touch-to-defeat for enemies and boss phases
- Audio system:
  - per-screen/level looping BGM
  - `SND ON/SND OFF` toggle with `localStorage` persistence
  - autoplay-safe fallback behavior + startup tip toast
- UX polish:
  - `Enter` works for Start/Continue and popup close
  - title screen controls guide
  - title start button loading animation
- Victory screen:
  - contact details and links
  - resume download link
  - special perfect-run toast if player defeats all enemies, collects all coins, and never dies

## Local Run

Because this uses ES modules, run from a local web server:

```bash
python3 -m http.server 8000
```

Then open:

`http://localhost:8000`

## Controls

- Move: `Arrow Left/Right` or `A/D`
- Jump: `Arrow Up` or `W`
- Attack/Shoot: `Space`
- Start/Continue/Close popup: `Enter`
- Cheat console: `~`, then type `escape` and press `Enter`
- Toggle audio: click `SND ON` / `SND OFF`
- Mobile: on-screen touch buttons

## Project Structure

- `index.html` - app shell and canvas
- `css/style.css` - styling, overlays, responsive + touch UI
- `js/data.js` - resume content mapped into game data
- `js/sprites.js` - procedural pixel-art drawing
- `js/engine.js` - loop/input/camera/collision
- `js/player.js` - player movement and fireballs
- `js/enemies.js` - enemy behavior and defeat logic
- `js/level.js` - level generation from resume data
- `js/boss.js` - boss phase logic
- `js/ui.js` - overlays/HUD popups
- `js/main.js` - game state machine + orchestration

## Deploy on GitHub Pages

1. Create a new GitHub repository.
2. Push this folder to the `main` branch.
3. In GitHub repo settings, open **Pages**.
4. Set source to **Deploy from a branch**, branch `main`, folder `/ (root)`.
5. Save and wait for deployment.

Your resume will be available at:

`https://<username>.github.io/<repository-name>/`
