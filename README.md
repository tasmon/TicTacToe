## "TicTacToe" for CloudPhone

A classic TicTacToe widget for CloudPhone feature phones. Play head-to-head
in 2 Player mode, or challenge the CPU across three difficulty levels, on a
3x3, 4x4, or 5x5 board, all wrapped in four selectable color themes and full
T9 D-pad controls.

## Add to CloudPhone
1. Go to [CloudPhone Developer Page](https://www.cloudfone.com/my).
2. Select **Add Widget**.
3. Paste this Start URL:
   `https://tasmon.github.io/TicTacToe`
4. Upload icons if required.
5. Save and refresh - **TicTacToe** will appear on your CloudPhone.

## Features
- **2 Player** - pass-and-play on one device.
- **Vs CPU** - Easy, Medium, and Hard difficulty. On the 3x3 board, Hard
  uses exact minimax and cannot be beaten. On 4x4/5x5, Hard uses a
  depth-limited alpha-beta search with a heuristic evaluator (full search
  isn't computationally feasible on larger boards), so it's very strong
  but not mathematically perfect.
- **Board Size** - 3x3, 4x4, or 5x5 (Settings page). 3-in-a-row wins on
  3x3; 4-in-a-row wins on 4x4/5x5.
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

