### TicTacToe for CloudPhone

Compact HTML5 TicTacToe optimized for **240×320** CloudPhone screens — play vs computer or local pass and play, choose **3×3 / 4×4 / 5×5** boards, switch themes, and enjoy lightweight sound effects.

<img width="268" height="627" alt="Screenshot From 2026-07-12 14-52-52" src="https://github.com/user-attachments/assets/e601ff61-e465-49e9-b134-02a45ce90b45" />


#### Add TicTacToe Widget to CloudPhone

Widget name: TicTacToe

Hosted URL: https://tasmon.github.io/tictactoe-cloudphone/

Supported screens: Portrait 240×320 (QVGA)

Modes: Play vs Computer; Local pass‑and‑play

Board sizes: 3×3, 4×4, 5×5

Features: Multiple themes, lightweight WebAudio sounds, touch‑friendly UI, no server required

---

#### Install and run locally
1. **Clone the repo**
```bash
git clone https://github.com/tasmon/tictactoe-cloudphone.git
cd tictactoe-cloudphone
```
2. **Open locally**
- Open `index.html` in your browser or copy files to a static server.
3. **Run a simple static server** (optional)
```bash
# Python 3
python -m http.server 8000
# then open http://localhost:8000
```

---

#### Publish with GitHub Pages
1. Push your code to `main` branch on GitHub.
2. In the repository Settings go to Pages and set the source to the `main` branch root.
3. After a minute the site will be available at:
```
https://tasmon.github.io/tictactoe-cloudphone/
```

---

#### Package as Android WebView APK
1. Create a minimal Android project with a single `WebView` activity.
2. Put the game files in `assets/www` and load `file:///android_asset/www/index.html`.
3. Set `targetSdk` and `minSdk` according to your CloudPhone capabilities.
4. Build with Android Studio and sign the APK for installation.

---

#### Customize
- **Themes**: Edit CSS variables in `style.css` or add `.theme-...` classes.
- **Board rules**: Change `winLen` logic in `app.js` to alter required in-a-row.
- **AI**: Adjust `difficultyDepth` values or replace heuristic in `app.js`.
- **Sounds**: Replace WebAudio with audio files and update `playSound` to use `Audio` objects.
- **Assets**: Add images or sprites to `assets/` and reference them in CSS or DOM.

---

#### Contributing
- **Fork** the repo, create a feature branch, commit changes, and open a pull request.
- Keep changes small and focused. Include screenshots for UI changes and note device tested.
- Add tests or manual test steps for logic or AI changes.

---

#### Troubleshooting
- **Audio blocked**: Some browsers require a user gesture before WebAudio plays. Tap the screen to enable sound.
- **Slow AI on 5×5**: Lower difficulty or reduce minimax depth for better performance on low-end devices.
- **Layout issues**: Ensure the browser viewport is set to `width=240, height=320` or use the provided CSS variables.

---

#### License and credits
**License**: MIT — see `LICENSE` file.  
**Credits**: Game logic, UI, and assets in this repo by Tasmon Islam
