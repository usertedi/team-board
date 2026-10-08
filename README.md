# Team Boards — Real-Time Linear-Style Project & Issue Management

**Team Boards** is a high-craft, real-time project and issue tracking workspace built with React, TypeScript, Vite, Tailwind CSS, `@dnd-kit`, TanStack Query, and Firebase (Authentication, Firestore real-time synchronization, and Row-Level Security rules).

## Architecture & Highlights

### 1. Tokenized Design System (`src/index.css`)
- **Dark Theme Default + Light Theme Toggle**: Near-black layered surfaces (`#08090A` canvas, `#0D0F12` panels, `#12151A` cards, `#181C23` hover/elevated states) with crisp `1px` borders and a single `#5E6AD2` indigo accent.
- **Typography & Accessibility**: `Inter` for UI copy (`>=14px` body, `>=12px` labels) and `JetBrains Mono` for issue identifiers (`ENG-1`, `DES-1`, `OPS-1`), visible `2px` focus rings, `aria-label` attributes on all icon controls, keyboard-operable card movement, and `prefers-reduced-motion` support.

### 2. Authentication & Profiles (`src/contexts/AuthContext.tsx`, `src/components/AuthScreen.tsx`)
- Email & password sign-in and account registration.
- Google OAuth sign-in and GitHub provider button (with a *"Coming soon"* tooltip until credentials are configured).
- Instant Demo Workspace access and live profile editor (display name, role title, avatar color).
- Strictly isolated PII in `/users_private/{userId}` vs public profiles in `/profiles/{userId}`.

### 3. Workspaces, Teams, RBAC & Security Rules (`firestore.rules`, `firebase-blueprint.json`)
- **15 Collections & Entities**: `profiles`, `users_private`, `workspaces`, `workspace_members`, `teams`, `boards`, `lists`, `issues`, `labels`, `issue_labels`, `comments`, `activity`, `invites`, `notifications`, and `pins`.
- **Row-Level Security (RLS / RBAC)**: Enforced in `firestore.rules` with helper functions (`isWorkspaceMember`, `canEditWorkspace`, `isWorkspaceAdminOrOwner`). Users with the `viewer` role have read-only access.
- **Seeded Demo Workspace**: Pre-populated on first run with **3 teams** (`ENG`, `DES`, `OPS`), **4 boards** across those teams, workflow lists, colored labels, and realistic engineering issues.

### 4. Kanban Board View & Fractional Drag-and-Drop (`src/components/KanbanBoardScreen.tsx`)
- Powered by `@dnd-kit/core` and `@dnd-kit/sortable` with a lifted drag overlay card, a dashed `"Drop here"` target slot, and fractional `position` calculation so moving a card updates a single record.
- Keyboard-accessible left/right column movement buttons on every card.
- Filter bar with text search (`F`), priority filter, assignee filter, label filter, sort selector, and group-by (`Status List` vs `Assignee`).
- Live / Offline connection badge and active board viewer presence avatars.

### 5. Full Issue Detail Side Panel (`src/components/IssueDetailPanel.tsx`)
- Opens as a right-hand slide-over inspector (`Esc` to close) with shareable URL copy (`/boards/:id/issues/:identifier`).
- Live markdown description editor, status list switcher, priority signal selector, assignee picker, story point estimate, due date, and colored label creation/toggling.
- Threaded comments (create, edit, and delete your own comments) and per-issue audit activity log.

### 6. Boards Overview, Templates, Command Palette & Shortcuts
- **Boards Overview (`src/components/BoardsOverviewScreen.tsx`)**: Pinned and all boards with progress bars computed strictly from real issues in each board's Done list vs total issues, Grid/List toggle, archive & restore workflow, and workspace-wide recent events feed.
- **Board Templates (`src/components/WorkspaceModals.tsx`)**: Create boards with pre-configured lists using **Kanban**, **Sprint**, or **Bug Tracker** templates.
- **Keyboard Shortcuts**:
  - `Ctrl/Cmd + K`: Command Palette (jump to board/issue, create issue/board, toggle theme)
  - `C`: Create new issue
  - `F`: Focus board filter input
  - `G` then `B`: Go to Boards Overview
  - `?`: Open Keyboard Shortcuts reference
  - `Esc`: Close active panel or modal
