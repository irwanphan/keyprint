# KeyPrint

A quiet count of what you actually typed and edited today — no scores, no shame.

KeyPrint lives in the status bar. It counts your keystrokes, not AI volume. Accepting a 5,000-character completion does not erase 200 characters you typed.

Counts stay on this machine. KeyPrint does not upload your code or keystrokes.

## Getting started

1. Install **KeyPrint** and reload the window.
2. Look at the status bar (bottom right): **KeyPrint**.
3. Type. The first number is what you typed. The second, if it appears, is what you typed on a block that just landed (tab, agent, or paste).
4. Click the status bar for today, this week, and your hand/edit print.

| You see | Meaning |
|---|---|
| `KeyPrint  200` | 200 characters typed today |
| `KeyPrint  200 · 40` | 200 typed, 40 of them on a freshly landed block |
| `KeyPrint  —` | No hand print yet today |
| `KeyPrint  off` | Counting is paused |

## Toggle

Command Palette: **KeyPrint: Toggle On/Off**.

While off, KeyPrint does not count. Click the status bar to turn it back on. Yesterday’s numbers stay until you reset them.

## Privacy

- Local `globalState` only — no account, no cloud
- No file contents, no keystroke log, no paths
- Last 7 local days, then pruned
- **KeyPrint: Reset Local Stats** clears this machine

## Commands

| Command | What it does |
|---|---|
| **KeyPrint: Show Today’s Credits** | Today, this week, print |
| **KeyPrint: Toggle On/Off** | Pause or resume counting |
| **KeyPrint: Reset Local Stats** | Delete local counts |

## License

MIT
