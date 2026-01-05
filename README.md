# TimeStack

A modern task planner desktop application built with Electron, React, and TypeScript.

![Electron](https://img.shields.io/badge/Electron-39-47848F?logo=electron)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite)

## Features

- **Calendar View** - Month, week, day, and agenda views
- **List View** - Task list with filters by status and priority
- **Task Management** - Create, edit, delete tasks with:
  - Title and description
  - Date assignment
  - Priority levels (Low, Normal, High, Critical)
  - Color coding (8 predefined colors)
  - Time estimates
- **Localization** - Russian and English languages
- **Local Storage** - SQLite database, works offline
- **Cross-platform** - Windows and macOS support

## Screenshots

_Coming soon_

## Installation

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/timestack.git
cd timestack

# Install dependencies
npm install

# Rebuild native modules for Electron
npx electron-rebuild -f -w better-sqlite3

# Start development server
npm run dev
```

## Development

### Available Scripts

| Command             | Description                              |
| ------------------- | ---------------------------------------- |
| `npm run dev`       | Start development server with hot reload |
| `npm run build`     | Build for production                     |
| `npm run build:win` | Build Windows installer (.exe)           |
| `npm run build:mac` | Build macOS package (.dmg)               |
| `npm run lint`      | Run ESLint                               |
| `npm run typecheck` | Run TypeScript type checking             |
| `npm run format`    | Format code with Prettier                |

### Project Structure

```
src/
├── main/           # Electron main process
│   ├── database/   # SQLite database layer
│   └── ipc/        # IPC handlers
├── preload/        # Preload scripts (contextBridge)
├── renderer/src/   # React application
│   ├── components/ # UI components
│   ├── store/      # Zustand state management
│   └── i18n/       # Internationalization
└── shared/         # Shared TypeScript types
```

### Tech Stack

- **electron-vite** - Build tooling with HMR
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Zustand** - State management
- **better-sqlite3** - SQLite database
- **Tailwind CSS** - Styling
- **react-big-calendar** - Calendar component
- **react-i18next** - Internationalization
- **date-fns** - Date utilities

## Building

### Windows

```bash
npm run build:win
```

Output: `dist/TimeStack-{version}-setup.exe`

### macOS

```bash
npm run build:mac
```

Output: `dist/TimeStack-{version}.dmg`

## Configuration

### Database Location

The SQLite database is stored in the user data directory:

- **Windows**: `%APPDATA%/timestack/timestack.db`
- **macOS**: `~/Library/Application Support/timestack/timestack.db`
- **Linux**: `~/.config/timestack/timestack.db`

### Language

The app detects system language automatically. You can switch between Russian and English using the language toggle in the header.

## Roadmap

- [ ] S3 cloud synchronization
- [ ] Drag & drop tasks between days
- [ ] Desktop notifications
- [ ] Dark theme
- [ ] Statistics and reports
- [ ] Recurring tasks
- [ ] Subtasks / checklists
- [ ] Export to CSV/JSON

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT

## Acknowledgments

- [electron-vite](https://electron-vite.org/) - Build tooling
- [react-big-calendar](https://jquense.github.io/react-big-calendar/) - Calendar component
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
