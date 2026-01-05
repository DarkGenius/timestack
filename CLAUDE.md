# CLAUDE.md - TimeStack Project Guide

## Project Overview

TimeStack is an Electron-based task planner application with calendar and list views. It allows users to create, manage, and organize tasks with priorities, colors, and time estimates.

## Architecture

### Technology Stack
- **Runtime**: Electron 39+
- **Frontend**: React 19 + TypeScript
- **Build Tool**: electron-vite
- **Database**: SQLite (better-sqlite3)
- **State Management**: Zustand
- **Styling**: Tailwind CSS v3
- **Calendar**: react-big-calendar
- **i18n**: react-i18next (RU/EN)

### Project Structure

```
timestack/
├── src/
│   ├── main/                    # Electron main process
│   │   ├── index.ts             # Main entry, window creation
│   │   ├── database/
│   │   │   ├── db.ts            # SQLite connection
│   │   │   ├── migrations.ts    # Schema definitions
│   │   │   └── queries.ts       # CRUD operations
│   │   └── ipc/
│   │       └── handlers.ts      # IPC handlers
│   ├── preload/
│   │   ├── index.ts             # contextBridge API exposure
│   │   └── index.d.ts           # TypeScript declarations
│   ├── renderer/src/            # React application
│   │   ├── App.tsx              # Root component
│   │   ├── main.tsx             # React entry point
│   │   ├── components/
│   │   │   ├── Calendar/        # Calendar view components
│   │   │   ├── TaskList/        # List view components
│   │   │   ├── TaskDialog/      # Task create/edit dialog
│   │   │   ├── ui/              # Reusable UI components
│   │   │   └── Header.tsx       # App header with navigation
│   │   ├── store/
│   │   │   ├── taskStore.ts     # Task state & actions
│   │   │   └── uiStore.ts       # UI state (view, filters, dialogs)
│   │   ├── i18n/
│   │   │   ├── index.ts         # i18n configuration
│   │   │   └── locales/         # Translation files
│   │   └── assets/
│   │       └── main.css         # Global styles + Tailwind
│   └── shared/
│       └── types.ts             # Shared TypeScript types
├── electron.vite.config.ts      # Vite configuration
├── electron-builder.yml         # Build configuration
├── tailwind.config.js           # Tailwind configuration
└── package.json
```

### Data Flow

```
User Action → React Component → Zustand Store → IPC (preload) → Main Process → SQLite
                    ↑                                                              |
                    └──────────────────────────────────────────────────────────────┘
```

### Key Patterns

1. **IPC Communication**: All database operations go through `window.api.tasks.*` exposed via contextBridge
2. **Optimistic Updates**: UI updates immediately, syncs with DB in background
3. **Soft Delete**: Tasks have `deleted_at` field, never physically deleted
4. **Type Safety**: Shared types in `src/shared/types.ts` used by both main and renderer

## Database Schema

### Tasks Table
- `id` (TEXT PRIMARY KEY) - UUID
- `title` (TEXT NOT NULL)
- `description` (TEXT)
- `date` (TEXT) - ISO date YYYY-MM-DD
- `priority` (TEXT) - low/normal/high/critical
- `color` (TEXT) - Hex color
- `estimated_time` (INTEGER) - Minutes
- `actual_time` (INTEGER) - Minutes
- `status` (TEXT) - open/completed
- `completed_at` (TEXT) - ISO timestamp
- `created_at`, `updated_at`, `deleted_at` (TEXT)
- `sync_status` (TEXT) - For future S3 sync

## Common Tasks

### Adding a new IPC handler
1. Add query function in `src/main/database/queries.ts`
2. Register handler in `src/main/ipc/handlers.ts`
3. Expose in `src/preload/index.ts`
4. Add types to `src/preload/index.d.ts`
5. Use via `window.api.tasks.newMethod()`

### Adding a new UI component
1. Create in `src/renderer/src/components/`
2. Use Tailwind classes for styling
3. Import translations with `useTranslation()`
4. Access state via Zustand hooks

### Adding translations
1. Add keys to `src/renderer/src/i18n/locales/ru.json`
2. Add keys to `src/renderer/src/i18n/locales/en.json`
3. Use with `t('key.path')`

### Rebuilding native modules
After updating Electron version:
```bash
npx electron-rebuild -f -w better-sqlite3
```

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run build:win    # Build Windows installer
npm run build:mac    # Build macOS DMG
npm run lint         # Run ESLint
npm run typecheck    # TypeScript check
```

## Important Notes

- Database file stored in: `app.getPath('userData')/timestack.db`
- Always use `format(date, 'yyyy-MM-dd')` for date strings
- Task colors are predefined in `TASK_COLORS` constant
- Priority colors defined in `PRIORITY_COLORS` constant
- Calendar uses date-fns for localization (ru/enUS locales)

## Future Enhancements (Not Implemented)

- S3 synchronization (tables ready: `sync_log`, `settings`)
- Drag & drop between calendar days
- Desktop notifications
- Dark theme
- Statistics dashboard
