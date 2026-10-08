import React, { useState } from 'react';
import {
  Search,
  CheckSquare,
  LayoutGrid,
  Activity,
  Bell,
  Pin,
  Users,
  ChevronDown,
  LogOut,
  User as UserIcon,
  Sun,
  Moon,
  Plus,
  HelpCircle,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Check,
  Columns,
  Shield,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTeamBoards } from '../contexts/TeamBoardsContext';
import { TeamBoardsWordmark, Kbd, UserAvatar } from './BrandAndPrimitives';

export type ShellView =
  | 'boards'
  | 'board_detail'
  | 'my_issues'
  | 'activity'
  | 'members';

interface AppShellProps {
  activeView: ShellView;
  onSelectView: (view: ShellView) => void;
  onOpenCommandPalette: () => void;
  onOpenNewIssue: () => void;
  onOpenNewBoard: () => void;
  shortcutsOpen: boolean;
  setShortcutsOpen: (open: boolean) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  activeView,
  onSelectView,
  onOpenCommandPalette,
  onOpenNewIssue,
  onOpenNewBoard,
  shortcutsOpen,
  setShortcutsOpen,
  theme,
  onToggleTheme,
  children,
}) => {
  const { profile, user, logout, updateUserProfile } = useAuth();
  const {
    workspaces,
    activeWorkspace,
    selectWorkspace,
    createWorkspace,
    teams,
    boards,
    issues,
    pins,
    notifications,
    presence,
    isOnline,
    currentUserRole,
    canEdit,
    activeBoardId,
    setActiveBoardId,
    openIssueByIdentifier,
    markNotificationRead,
    markAllNotificationsRead,
  } = useTeamBoards();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [wsDropdownOpen, setWsDropdownOpen] = useState(false);
  const [creatingWs, setCreatingWs] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Profile Editor Modal State
  const [editName, setEditName] = useState(profile?.displayName || '');
  const [editTitle, setEditTitle] = useState(
    profile?.title || 'Product Engineering'
  );
  const [editColor, setEditColor] = useState(profile?.color || '#5E6AD2');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSavedToast, setProfileSavedToast] = useState(false);

  if (!profile) return null;

  const currentUserId = profile.uid || user?.uid || 'usr-demo-elena';
  const myAssignedCount = issues.filter(
    (i) => i.assigneeId === currentUserId
  ).length;
  const unreadNotifications = notifications.filter((n) => !n.read);
  const pinnedBoardIds = new Set(pins.map((p) => p.boardId));
  const pinnedBoards = boards.filter(
    (b) => !b.archived && pinnedBoardIds.has(b.id)
  );
  const activeBoard =
    boards.find((b) => b.id === activeBoardId) || boards[0];

  const openProfileModal = () => {
    setEditName(profile.displayName);
    setEditTitle(profile.title || 'Product Engineering');
    setEditColor(profile.color);
    setUserMenuOpen(false);
    setProfileModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    setSavingProfile(true);
    try {
      await updateUserProfile({
        displayName: editName,
        title: editTitle,
        color: editColor,
      });
      setProfileSavedToast(true);
      setTimeout(() => {
        setProfileSavedToast(false);
        setProfileModalOpen(false);
      }, 800);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCreateWorkspaceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    createWorkspace(newWsName.trim());
    setNewWsName('');
    setCreatingWs(false);
    setWsDropdownOpen(false);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      {/* Left Sidebar */}
      <aside
        aria-label="Workspace Navigation"
        className={`${
          sidebarCollapsed ? 'w-[56px]' : 'w-[256px]'
        } bg-[var(--bg-surface-1)] border-r border-[var(--border-subtle)] flex flex-col justify-between shrink-0 transition-all duration-150 select-none z-20`}
      >
        <div className="p-3 space-y-3 overflow-y-auto">
          {/* Workspace Switcher */}
          <div className="relative flex items-center justify-between gap-1">
            {!sidebarCollapsed ? (
              <button
                type="button"
                onClick={() => setWsDropdownOpen((o) => !o)}
                aria-expanded={wsDropdownOpen}
                aria-label="Switch workspace"
                className="flex-1 h-9 px-2 rounded-[var(--radius-sm)] hover:bg-[var(--bg-surface-2)] flex items-center justify-between gap-2 transition-colors cursor-pointer min-w-0"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <TeamBoardsWordmark size="sm" showText={false} />
                  <span className="text-[14px] font-semibold text-[var(--text-primary)] truncate">
                    {activeWorkspace.name}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setSidebarCollapsed(false)}
                aria-label="Expand sidebar"
                className="w-9 h-9 mx-auto rounded-[var(--radius-sm)] hover:bg-[var(--bg-surface-2)] flex items-center justify-center cursor-pointer"
              >
                <PanelLeftOpen className="w-4 h-4 text-[var(--text-secondary)]" />
              </button>
            )}

            {!sidebarCollapsed && (
              <button
                type="button"
                onClick={() => setSidebarCollapsed(true)}
                aria-label="Collapse sidebar"
                className="w-8 h-8 rounded-[var(--radius-sm)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)] flex items-center justify-center shrink-0 cursor-pointer"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            )}

            {/* Workspace Dropdown Menu */}
            {wsDropdownOpen && !sidebarCollapsed && (
              <div className="absolute top-10 left-0 w-full bg-[var(--bg-surface-3)] border border-[var(--border-strong)] rounded-[var(--radius-md)] p-2 shadow-xl z-30 space-y-1.5">
                <div className="px-2 py-0.5 text-[12px] font-medium text-[var(--text-muted)]">
                  Workspaces
                </div>
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    type="button"
                    onClick={() => {
                      selectWorkspace(ws.id);
                      setWsDropdownOpen(false);
                    }}
                    className={`w-full px-2.5 py-2 rounded-[var(--radius-sm)] text-left flex items-center justify-between text-[13px] cursor-pointer ${
                      activeWorkspace.id === ws.id
                        ? 'bg-[var(--bg-selected)] text-[var(--text-primary)] font-medium'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)]'
                    }`}
                  >
                    <span className="truncate">{ws.name}</span>
                    {activeWorkspace.id === ws.id && (
                      <Check className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0" />
                    )}
                  </button>
                ))}

                <div className="pt-1 border-t border-[var(--border-subtle)]">
                  {creatingWs ? (
                    <form
                      onSubmit={handleCreateWorkspaceSubmit}
                      className="space-y-1.5 p-1"
                    >
                      <input
                        type="text"
                        autoFocus
                        value={newWsName}
                        onChange={(e) => setNewWsName(e.target.value)}
                        placeholder="Workspace name..."
                        className="w-full h-8 px-2 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] text-[13px] text-[var(--text-primary)] outline-none"
                      />
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setCreatingWs(false)}
                          className="h-7 px-2 text-[12px] text-[var(--text-muted)] cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="h-7 px-2.5 rounded-[var(--radius-sm)] bg-[var(--accent-primary)] text-white text-[12px] font-medium cursor-pointer"
                        >
                          Create
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setCreatingWs(true)}
                      className="w-full h-8 px-2.5 rounded-[var(--radius-sm)] text-[13px] text-[var(--accent-primary)] hover:bg-[var(--bg-surface-2)] flex items-center gap-1.5 font-medium cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create New Workspace</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Search & New Issue Action */}
          {!sidebarCollapsed && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onOpenCommandPalette}
                aria-label="Open command palette"
                className="flex-1 h-9 px-2.5 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center justify-between text-[13px] transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5" />
                  <span>Search...</span>
                </span>
                <Kbd>⌘K</Kbd>
              </button>

              {canEdit && (
                <button
                  type="button"
                  onClick={onOpenNewIssue}
                  aria-label="Create new issue"
                  title="New Issue (C)"
                  className="h-9 px-2.5 rounded-[var(--radius-sm)] bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white flex items-center gap-1 text-[13px] font-medium shrink-0 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Issue</span>
                </button>
              )}
            </div>
          )}

          {/* Primary Navigation Links */}
          <nav aria-label="Main Navigation" className="space-y-1">
            {[
              {
                id: 'my_issues' as ShellView,
                label: 'My Issues',
                icon: <CheckSquare className="w-4 h-4" />,
                badge: String(myAssignedCount),
              },
              {
                id: 'boards' as ShellView,
                label: 'Boards',
                icon: <LayoutGrid className="w-4 h-4" />,
                badge: String(boards.filter((b) => !b.archived).length),
              },
              {
                id: 'board_detail' as ShellView,
                label: 'Active Board',
                icon: <Columns className="w-4 h-4" />,
              },
              {
                id: 'activity' as ShellView,
                label: 'Activity',
                icon: <Activity className="w-4 h-4" />,
              },
              {
                id: 'members' as ShellView,
                label: 'Members & Invites',
                icon: <Users className="w-4 h-4" />,
              },
            ].map((item) => {
              const active = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectView(item.id)}
                  aria-label={item.label}
                  title={item.label}
                  className={`w-full h-9 px-2.5 rounded-[var(--radius-sm)] flex items-center ${
                    sidebarCollapsed ? 'justify-center' : 'justify-between'
                  } text-[14px] font-medium transition-colors cursor-pointer ${
                    active
                      ? 'bg-[var(--bg-selected)] text-[var(--text-primary)] border border-[var(--accent-primary)]/40'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)] hover:text-[var(--text-primary)] border border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <span
                      className={
                        active
                          ? 'text-[var(--accent-primary)]'
                          : 'text-[var(--text-muted)]'
                      }
                    >
                      {item.icon}
                    </span>
                    {!sidebarCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </span>
                  {!sidebarCollapsed && item.badge && (
                    <span className="text-[12px] font-mono-id text-[var(--text-muted)]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Pinned Boards Section */}
          {!sidebarCollapsed && (
            <div className="pt-3 border-t border-[var(--border-subtle)] space-y-1">
              <div className="px-2 py-1 flex items-center justify-between text-[12px] font-medium text-[var(--text-muted)]">
                <span className="flex items-center gap-1.5">
                  <Pin className="w-3.5 h-3.5" />
                  <span>Pinned Boards</span>
                </span>
                <span className="font-mono-id">{pinnedBoards.length}</span>
              </div>
              {pinnedBoards.length === 0 ? (
                <div className="px-2.5 py-1.5 text-[12px] text-[var(--text-muted)]">
                  Pin boards for quick access
                </div>
              ) : (
                pinnedBoards.map((b) => {
                  const isActive =
                    activeView === 'board_detail' && activeBoardId === b.id;
                  const openCount = issues.filter(
                    (i) => i.boardId === b.id
                  ).length;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        setActiveBoardId(b.id);
                        onSelectView('board_detail');
                      }}
                      className={`w-full h-8 px-2.5 rounded-[var(--radius-sm)] flex items-center justify-between text-[13px] transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[var(--bg-selected)] text-[var(--text-primary)] font-medium'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <span className="font-mono-id text-[12px] text-[var(--accent-primary)] font-medium">
                          {b.teamKey}
                        </span>
                        <span className="truncate">{b.title}</span>
                      </span>
                      <span className="font-mono-id text-[12px] text-[var(--text-muted)]">
                        {openCount}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          )}

          {/* Teams Section */}
          {!sidebarCollapsed && (
            <div className="pt-3 border-t border-[var(--border-subtle)] space-y-1">
              <div className="px-2 py-1 flex items-center justify-between text-[12px] font-medium text-[var(--text-muted)]">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>Teams</span>
                </span>
                {canEdit && (
                  <button
                    type="button"
                    onClick={onOpenNewBoard}
                    className="text-[12px] text-[var(--accent-primary)] hover:underline cursor-pointer"
                  >
                    + Board
                  </button>
                )}
              </div>
              {teams.map((team) => {
                const teamBoards = boards.filter(
                  (b) => b.teamId === team.id && !b.archived
                );
                return (
                  <button
                    key={team.id}
                    type="button"
                    onClick={() => {
                      if (teamBoards[0]) {
                        setActiveBoardId(teamBoards[0].id);
                        onSelectView('board_detail');
                      } else {
                        onSelectView('boards');
                      }
                    }}
                    className="w-full h-8 px-2.5 rounded-[var(--radius-sm)] flex items-center justify-between text-[13px] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span
                        style={{ backgroundColor: team.color }}
                        className="w-2 h-2 rounded-full shrink-0"
                      />
                      <span className="font-mono-id text-[12px] text-[var(--text-muted)]">
                        {team.key}
                      </span>
                      <span className="truncate">{team.name}</span>
                    </span>
                    <span className="font-mono-id text-[12px] text-[var(--text-muted)]">
                      {teamBoards.length}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom User Profile Bar */}
        <div className="p-3 border-t border-[var(--border-subtle)] relative">
          <button
            type="button"
            onClick={() => setUserMenuOpen((o) => !o)}
            aria-label="User profile menu"
            aria-expanded={userMenuOpen}
            className={`w-full p-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--bg-surface-2)] flex items-center ${
              sidebarCollapsed ? 'justify-center' : 'justify-between'
            } gap-2 transition-colors cursor-pointer`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <UserAvatar
                displayName={profile.displayName}
                initials={profile.initials}
                color={profile.color}
                avatarUrl={profile.avatarUrl}
                size="md"
              />
              {!sidebarCollapsed && (
                <div className="text-left min-w-0">
                  <div className="text-[13px] font-medium text-[var(--text-primary)] truncate">
                    {profile.displayName}
                  </div>
                  <div className="text-[12px] text-[var(--text-muted)] uppercase font-mono-id truncate">
                    Role: {currentUserRole}
                  </div>
                </div>
              )}
            </div>
            {!sidebarCollapsed && (
              <ChevronDown className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
            )}
          </button>

          {userMenuOpen && (
            <div className="absolute bottom-16 left-3 right-3 bg-[var(--bg-surface-3)] border border-[var(--border-strong)] rounded-[var(--radius-md)] p-1.5 shadow-xl z-30 space-y-1">
              <div className="px-2.5 py-1.5 border-b border-[var(--border-subtle)]">
                <div className="text-[13px] font-semibold text-[var(--text-primary)] truncate">
                  {profile.displayName}
                </div>
                <div className="text-[12px] text-[var(--text-muted)] truncate">
                  {user?.email || 'Workspace Session'}
                </div>
              </div>

              <button
                type="button"
                onClick={openProfileModal}
                className="w-full h-8 px-2.5 rounded-[var(--radius-sm)] text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)] flex items-center gap-2 cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Edit Profile & Avatar</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectView('members');
                  setUserMenuOpen(false);
                }}
                className="w-full h-8 px-2.5 rounded-[var(--radius-sm)] text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)] flex items-center gap-2 cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Role & Invite Settings</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onToggleTheme();
                  setUserMenuOpen(false);
                }}
                className="w-full h-8 px-2.5 rounded-[var(--radius-sm)] text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)] flex items-center gap-2 cursor-pointer"
              >
                {theme === 'dark' ? (
                  <Sun className="w-3.5 h-3.5 text-[#E5A83B]" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                )}
                <span>
                  Switch to {theme === 'dark' ? 'Light' : 'Dark'} Theme
                </span>
              </button>

              <div className="border-t border-[var(--border-subtle)] pt-1">
                <button
                  type="button"
                  onClick={logout}
                  className="w-full h-8 px-2.5 rounded-[var(--radius-sm)] text-[13px] text-[#EB5757] hover:bg-[#EB5757]/10 flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Bar with Breadcrumbs, Viewer Read-Only Notice, Presence Avatars, Live/Offline Badge, Notifications */}
        <header className="h-[52px] px-5 bg-[var(--bg-surface-1)] border-b border-[var(--border-subtle)] flex items-center justify-between gap-3 shrink-0 z-10">
          {/* Left Breadcrumb / Context */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => onSelectView('boards')}
              className="text-[13px] font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] truncate cursor-pointer"
            >
              {activeWorkspace.name}
            </button>
            <span className="text-[var(--text-muted)]">/</span>
            {activeView === 'board_detail' && activeBoard ? (
              <div className="flex items-center gap-2 min-w-0">
                <span className="px-1.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--accent-tint)] text-[var(--accent-primary)] font-mono-id text-[12px] font-semibold">
                  {activeBoard.teamKey}
                </span>
                <select
                  aria-label="Select active board"
                  value={activeBoard.id}
                  onChange={(e) => setActiveBoardId(e.target.value)}
                  className="bg-transparent text-[14px] font-semibold text-[var(--text-primary)] outline-none cursor-pointer truncate"
                >
                  {boards
                    .filter((b) => !b.archived)
                    .map((b) => (
                      <option
                        key={b.id}
                        value={b.id}
                        className="bg-[var(--bg-surface-1)]"
                      >
                        {b.title}
                      </option>
                    ))}
                </select>
              </div>
            ) : (
              <span className="text-[14px] font-semibold text-[var(--text-primary)] truncate">
                {activeView === 'boards' && 'Boards Overview'}
                {activeView === 'my_issues' && 'My Issues'}
                {activeView === 'activity' && 'Workspace Activity'}
                {activeView === 'members' && 'Members, Roles & Invites'}
              </span>
            )}

            {!canEdit && (
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-sm)] bg-[#E5A83B]/15 border border-[#E5A83B]/40 text-[#E5A83B] text-[12px] font-medium">
                Viewer (Read-Only)
              </span>
            )}
          </div>

          {/* Right Presence Avatars + Live/Offline Badge + Theme + Shortcuts + Notifications */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Realtime Presence Avatars of Members Currently Viewing the Board */}
            <div
              className="hidden sm:flex items-center -space-x-1.5 mr-1"
              title="Members currently viewing this board (Realtime presence)"
            >
              {presence.map((p) => (
                <UserAvatar
                  key={p.id}
                  displayName={`${p.displayName} (${p.lastSeen})`}
                  initials={p.initials}
                  color={p.color}
                  size="sm"
                />
              ))}
            </div>

            {/* Live / Offline Connection Badge */}
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-sm)] border text-[12px] font-medium ${
                isOnline
                  ? 'bg-[var(--bg-surface-2)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
                  : 'bg-[#EB5757]/10 border-[#EB5757]/40 text-[#EB5757]'
              }`}
              title={
                isOnline
                  ? 'Realtime synchronization connected'
                  : 'Offline — changes will sync when reconnected'
              }
            >
              {isOnline ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-[var(--status-done)] animate-pulse" />
                  <Wifi className="w-3.5 h-3.5 text-[var(--status-done)] hidden md:inline" />
                  <span>Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5" />
                  <span>Offline</span>
                </>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={
                theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
              }
              title={
                theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
              }
              className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-[#E5A83B]" />
              ) : (
                <Moon className="w-4 h-4 text-[var(--accent-primary)]" />
              )}
            </button>

            {/* Keyboard Help (?) */}
            <button
              type="button"
              onClick={() => setShortcutsOpen(true)}
              aria-label="Keyboard shortcuts help"
              title="Keyboard shortcuts (?)"
              className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Notifications Bell with Unread Count */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen((o) => !o)}
                aria-label={`Notifications (${unreadNotifications.length} unread)`}
                className="h-8 px-2.5 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] border border-[var(--border-subtle)] flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifications.length > 0 && (
                  <span className="px-1.5 rounded-full bg-[var(--accent-primary)] text-white text-[12px] font-mono-id font-semibold leading-4">
                    {unreadNotifications.length}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-[360px] bg-[var(--bg-surface-3)] border border-[var(--border-strong)] rounded-[var(--radius-lg)] shadow-xl p-3 z-30 space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
                    <span className="text-[13px] font-semibold text-[var(--text-primary)]">
                      Notifications ({unreadNotifications.length} unread)
                    </span>
                    {unreadNotifications.length > 0 && (
                      <button
                        type="button"
                        onClick={markAllNotificationsRead}
                        className="text-[12px] text-[var(--accent-primary)] hover:underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-[13px] text-[var(--text-muted)]">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markNotificationRead(n.id);
                            openIssueByIdentifier(n.issueIdentifier);
                            onSelectView('board_detail');
                            setNotificationsOpen(false);
                          }}
                          className={`p-2.5 rounded-[var(--radius-sm)] border transition-colors cursor-pointer ${
                            !n.read
                              ? 'bg-[var(--bg-selected)] border-[var(--accent-primary)]/40'
                              : 'bg-[var(--bg-surface-2)] border-[var(--border-subtle)]'
                          } space-y-1`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono-id text-[12px] font-semibold text-[var(--accent-primary)]">
                              {n.issueIdentifier}
                            </span>
                            <span className="font-mono-id text-[12px] text-[var(--text-muted)]">
                              {n.createdAt}
                            </span>
                          </div>
                          <p className="text-[13px] text-[var(--text-primary)]">
                            {n.title}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Viewport */}
        <main className="flex-1 flex min-h-0 overflow-hidden">{children}</main>
      </div>

      {/* Edit Profile Modal */}
      {profileModalOpen && (
        <div
          onClick={() => setProfileModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-modal-title"
            className="w-full max-w-[440px] bg-[var(--bg-surface-1)] border border-[var(--border-strong)] rounded-[var(--radius-lg)] p-6 shadow-xl space-y-5"
          >
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h2
                id="profile-modal-title"
                className="text-[16px] font-semibold text-[var(--text-primary)]"
              >
                Profile Settings
              </h2>
              <button
                type="button"
                onClick={() => setProfileModalOpen(false)}
                aria-label="Close profile modal"
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="profile-display-name"
                  className="block text-[12px] font-medium text-[var(--text-secondary)]"
                >
                  Display Name
                </label>
                <input
                  id="profile-display-name"
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full h-9 px-3 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-[var(--radius-sm)] text-[14px] text-[var(--text-primary)] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="profile-role-title"
                  className="block text-[12px] font-medium text-[var(--text-secondary)]"
                >
                  Title
                </label>
                <input
                  id="profile-role-title"
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full h-9 px-3 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-[var(--radius-sm)] text-[14px] text-[var(--text-primary)] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <span className="block text-[12px] font-medium text-[var(--text-secondary)]">
                  Avatar Color
                </span>
                <div className="flex items-center gap-2">
                  {[
                    '#5E6AD2',
                    '#27C383',
                    '#E5A83B',
                    '#8B95E5',
                    '#EB5757',
                    '#0EA5E9',
                  ].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setEditColor(c)}
                      aria-label={`Select color ${c}`}
                      style={{ backgroundColor: c }}
                      className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer ${
                        editColor === c
                          ? 'ring-2 ring-offset-2 ring-[var(--text-primary)] ring-offset-[var(--bg-surface-1)]'
                          : 'opacity-75 hover:opacity-100'
                      }`}
                    >
                      {editColor === c && (
                        <Check className="w-3.5 h-3.5 text-white" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                {profileSavedToast ? (
                  <span className="text-[13px] text-[var(--status-done)] flex items-center gap-1.5 font-medium">
                    <Check className="w-4 h-4" />
                    <span>Saved</span>
                  </span>
                ) : (
                  <span />
                )}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setProfileModalOpen(false)}
                    className="h-9 px-3 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] text-[var(--text-secondary)] text-[13px] font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="h-9 px-4 rounded-[var(--radius-sm)] bg-[var(--accent-primary)] text-white text-[13px] font-medium cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Modal (?) */}
      {shortcutsOpen && (
        <div
          onClick={() => setShortcutsOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="shortcuts-modal-title"
            className="w-full max-w-[440px] bg-[var(--bg-surface-1)] border border-[var(--border-strong)] rounded-[var(--radius-lg)] p-6 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h2
                id="shortcuts-modal-title"
                className="text-[16px] font-semibold text-[var(--text-primary)]"
              >
                Keyboard Shortcuts
              </h2>
              <button
                type="button"
                onClick={() => setShortcutsOpen(false)}
                aria-label="Close shortcuts dialog"
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2.5 text-[13px]">
              {[
                { label: 'Command Palette', keys: '⌘ K / Ctrl K' },
                { label: 'Create New Issue', keys: 'C' },
                { label: 'Focus Board Filter Box', keys: 'F' },
                { label: 'Go to Boards Overview', keys: 'G then B' },
                { label: 'Show Keyboard Help', keys: '?' },
                { label: 'Close Side Panel / Modal', keys: 'Esc' },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex items-center justify-between py-1.5 border-b border-[var(--border-subtle)] last:border-0"
                >
                  <span className="text-[var(--text-secondary)]">{s.label}</span>
                  <Kbd>{s.keys}</Kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
