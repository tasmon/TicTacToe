## "TicTacToe" for CloudPhone

A classic 3x3 TicTacToe widget for CloudPhone feature phones. Play head-to-head
in 2 Player mode, or challenge the CPU across three difficulty levels, all
wrapped in four selectable color themes and full T9 D-pad controls.

## Add to CloudPhone
1. Go to [CloudPhone Developer Page](https://www.cloudfone.com/my).
2. Select **Add Widget**.
3. Paste this Start URL:
   `https://tasmon.github.io/tictactoe`
4. Upload icons if required.
5. Save and refresh - **TicTacToe** will appear on your CloudPhone.

## Features
- **2 Player** - pass-and-play on one device.
- **Vs CPU** - Easy, Medium, and Hard difficulty (Hard uses minimax and
  cannot be beaten, only tied).
- **4 Themes** - Classic, Midnight, Retro, Ocean (Settings page).
- **Sound** - optional Web Audio beeps for moves, wins, and draws.
- **Stats tracking** - wins / losses / draws saved locally, resettable.
- **Settings, Help, and About** pages, reachable from the title screen and
  the in-game Pause menu.

## Controls

| Key                   | Action                          |
| ---------------------- | -------------------------------- |
| `2` / `8` (or Up/Down Arrow)   | Move D-pad cursor Up / Down      |
| `4` / `6` (or Left/Right Arrow) | Move D-pad cursor Left / Right   |
| `5` (or Enter)          | Place mark / Select menu item    |
| `0`                     | Pause the game                   |
| Left Softkey (`Escape`) | Menu (opens Pause overlay in-game) |
| Right Softkey           | Back / Resume                    |

## Project Structure

```
tictactoe/
├── index.html        Title screen + game screen (single-page, History API driven)
├── settings.html      Theme / difficulty / sound / stats (secondary page)
├── help.html           Controls & rules (secondary page)
├── about.html           App info, version, developer credit (secondary page)
├── style.css             Shared styles + 4 theme palettes, QVGA/QQVGA responsive
├── common.js             Shared CloudPhone helpers (LSK/RSK, storage, sound, focus)
├── ai.js                  Win detection + CPU opponent (easy/medium/hard)
├── game.js                Main screen state machine, rendering, input handling
├── settings.js             Settings page logic
├── icon-40.png / icon-80.png / icon-512.png   Widget icons
└── README.md
```

## Navigation Model
`index.html` is the CloudPhone "home" screen: RSK is left unintercepted and
all internal screen/overlay transitions are driven by `history.pushState` /
`replaceState` + `popstate`, so the native back button naturally resumes a
paused game, closes the game-over overlay, or returns to the title menu.
`settings.html`, `help.html`, and `about.html` are secondary pages reached by
a full navigation; on those pages RSK is manually intercepted (multi-alias
check) and always returns to `index.html`.

## Run Locally
No build step is required - these are static files.
1. Open `index.html` directly in a browser, or serve the folder with any
   static file server (e.g. `npx serve .`).
2. In Chrome DevTools, toggle the device toolbar and set dimensions to
   240x320 (QVGA) or 128x160 (QQVGA) to preview at CloudPhone resolutions.
3. Use arrow keys, Enter, `0-9`, and Esc to simulate the keypad, and the
   browser's back button to simulate RSK.

## Deploy to GitHub Pages
All files are flat (no subfolders) so this repository can be published
directly via GitHub Pages from the `main` branch, root folder.

## License
Developed by Tasmon Islam.
