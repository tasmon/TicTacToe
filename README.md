### TicTacToe for CloudPhone

Compact HTML5 TicTacToe optimized for **240×320** CloudPhone screens - play vs computer or local pass and play, choose **3×3 / 4×4 / 5×5** boards, switch themes, and enjoy lightweight sound effects.

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

#### Troubleshooting
- **Audio blocked**: Some browsers require a user gesture before WebAudio plays. Tap the screen to enable sound.
- **Slow AI on 5×5**: Lower difficulty or reduce minimax depth for better performance on low-end devices.
- **Layout issues**: Ensure the browser viewport is set to `width=240, height=320` or use the provided CSS variables.

---

#### License and credits
**License**: MIT — see `LICENSE` file.  
**Credits**: Game logic, UI, and assets in this repo by Tasmon Islam
