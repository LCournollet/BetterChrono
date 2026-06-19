# BetterChrono

A customizable training timer — a **desktop** application (Windows / macOS / Linux) with a clean, professional, clinical design.

Build workouts with multiple exercises, work and rest durations, launch a session with a clear timer, track your week in a calendar, and import / export your workouts as JSON.

---

## Tech stack

- **Electron** — desktop application
- **React + TypeScript** — UI
- **Vite** (via `electron-vite`) — build & hot-reload
- **Tailwind CSS** — clinical design system
- **localStorage** — local storage (no data ever leaves your computer)

## Requirements

- [Node.js](https://nodejs.org/) **18 or higher** and npm.

## Installation

```bash
npm install
```

## Run in development

Launches the Electron app with hot module reloading:

```bash
npm run dev
```

> On the very first launch, **demo data** (2 workouts + a few sessions) is created automatically so you can try the app right away.

## Type checking

```bash
npm run typecheck
```

## Build the application

Generates installable executables in the `release/` folder:

```bash
# Windows (.exe / NSIS)
npm run build:win

# macOS (.dmg)
npm run build:mac

# Linux (AppImage)
npm run build:linux
```

To compile only, without packaging:

```bash
npm run build
```

Preview the production build without packaging:

```bash
npm start
```

---

## Features

### Workouts
- Create / edit / duplicate / delete workouts.
- Exercises with **name**, **work duration**, **rest duration**, **notes**.
- Reorder exercises, durations entered in seconds or minutes.

### Session (timer)
- Large central timer with a progress ring, readable from a distance.
- **Work** / **Rest** phase, current exercise, next exercise, progress "Exercise 3 / 8".
- Controls: **start, pause, resume, stop, previous, next**.
- Adjustments **+5 / +10 / −5 / −10 seconds**.
- Automatic chaining work → rest → next exercise.
- Stop with confirmation, **end-of-session summary**.
- Keyboard shortcuts: `Space` (pause/resume), `←` / `→` (previous/next).
- The session survives a page **reload** (resumes paused).

### Calendar & tracking
- **Weekly** view (one column per day) with navigation between weeks.
- Automatic recording of each session: name, date, start/end times, duration, completed exercises, status **completed / interrupted**.
- Quickly identify the days you trained.

### Statistics
- Number of sessions, total duration, completed / interrupted sessions, most frequent workouts — per week.

### JSON import / export
- Export a single workout, or **all** workouts in one file.
- **Copy JSON** button and **download** via native file dialog.
- Import by **file** or **pasted text**, with a **preview** before confirming.
- Strict validation (invalid JSON, missing field, invalid duration, no exercises).
- **Duplicate** handling: replace / duplicate with "copy" / skip.
- Versioned format, example provided in [`examples/workout-example.json`](examples/workout-example.json).

---

## JSON format

Single workout:

```json
{
  "version": 1,
  "type": "workout",
  "workout": {
    "name": "Upper body session",
    "notes": "Push-ups, dips and core",
    "exercises": [
      { "name": "Push-ups", "workDurationSeconds": 45, "restDurationSeconds": 30, "notes": "Controlled tempo" }
    ]
  }
}
```

Collection of multiple workouts: `"type": "workout-collection"` with a `workouts` array (see [`examples/workout-collection-example.json`](examples/workout-collection-example.json)).

---

## Project structure

```
src/
├── main/                  # Electron main process (window, file dialogs)
├── preload/               # Secure bridge (JSON dialog IPC)
└── renderer/
    ├── index.html
    └── src/
        ├── components/    # Reusable components + design system (ui/)
        ├── pages/         # Pages (Dashboard, Workouts, Edit, Session, Calendar, Stats, Settings)
        ├── layout/        # AppShell, Sidebar
        ├── hooks/         # useTimer (timer logic), useNavigation
        ├── utils/         # time, id, json (export/import/validation), workout, stats
        ├── storage/       # StoreContext, localStorage access, demo data
        └── types/         # Domain TypeScript types
examples/                  # Example JSON files
```

## Design notes

- The **timer logic** is fully isolated in `hooks/useTimer.ts` (clock-based countdown without drift, pause/resume, navigation, adjustments, persistence).
- **JSON import/export** relies on dedicated, testable utility functions: `exportWorkoutToJson`, `importWorkoutsFromJson`, `validateWorkoutJson`.
- The **design** follows a clinical palette (off-white, medical blue, sage green), `rounded-xl` cards, thin borders and light shadows.
