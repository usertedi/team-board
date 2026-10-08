/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import {
  TeamBoardsProvider,
  useTeamBoards,
} from './contexts/TeamBoardsContext';
import { AuthScreen } from './components/AuthScreen';
import { AppShell, ShellView } from './components/AppShell';
import { BoardsOverviewScreen } from './components/BoardsOverviewScreen';
import { KanbanBoardScreen } from './components/KanbanBoardScreen';
import { IssueDetailPanel } from './components/IssueDetailPanel';
import {
  MyIssuesScreen,
  ActivityFeedScreen,
  MembersAndInvitesScreen,
} from './components/CollaborationScreens';
import {
  CommandPaletteModal,
  CreateIssueModal,
  CreateBoardModal,
} from './components/WorkspaceModals';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      refetchOnWindowFocus: false,
    },
  },
});

function TeamBoardsWorkspaceContent({
  theme,
  onToggleTheme,
}: {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}) {
  const {
    activeBoardId,
    setActiveBoardId,
    inspectedIssueId,
    setInspectedIssueId,
    openIssueByIdentifier,
    acceptInviteToken,
  } = useTeamBoards();

  const [activeView, setActiveView] = useState<ShellView>('boards');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [createIssueOpen, setCreateIssueOpen] = useState(false);
  const [createIssueListId, setCreateIssueListId] = useState<
    string | undefined
  >(undefined);
  const [createBoardOpen, setCreateBoardOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [inviteBannerMessage, setInviteBannerMessage] = useState<string | null>(
    null
  );

  const filterInputRef = useRef<HTMLInputElement | null>(null);
  const gChordActiveRef = useRef<boolean>(false);
  const gChordTimerRef = useRef<number | null>(null);

  // Support shareable URLs like /boards/:id/issues/:number or ?invite=token
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/boards\/([^/]+)\/issues\/([A-Za-z0-9-]+)/);
    if (match) {
      const [, boardId, issueIdentifier] = match;
      setActiveBoardId(boardId);
      setActiveView('board_detail');
      openIssueByIdentifier(issueIdentifier);
    }
    const params = new URLSearchParams(window.location.search);
    const inviteToken = params.get('invite');
    if (inviteToken) {
      const res = acceptInviteToken(inviteToken);
      setInviteBannerMessage(res.message);
      setActiveView('members');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [setActiveBoardId, openIssueByIdentifier, acceptInviteToken]);

  // Global Keyboard Shortcuts (Disabled when typing inside inputs, textareas, selects)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command/Ctrl + K always toggles Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
        return;
      }

      const target = e.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if (e.key === 'Escape') {
        if (commandPaletteOpen) {
          setCommandPaletteOpen(false);
          return;
        }
        if (createIssueOpen) {
          setCreateIssueOpen(false);
          return;
        }
        if (createBoardOpen) {
          setCreateBoardOpen(false);
          return;
        }
        if (shortcutsOpen) {
          setShortcutsOpen(false);
          return;
        }
        if (inspectedIssueId) {
          setInspectedIssueId(null);
          return;
        }
      }

      if (isTyping) return;

      // Chord: G then B -> Go to Boards Overview
      if (gChordActiveRef.current) {
        gChordActiveRef.current = false;
        if (gChordTimerRef.current) {
          window.clearTimeout(gChordTimerRef.current);
        }
        if (e.key.toLowerCase() === 'b') {
          e.preventDefault();
          setActiveView('boards');
          return;
        }
      }

      if (e.key.toLowerCase() === 'g' && !e.metaKey && !e.ctrlKey) {
        gChordActiveRef.current = true;
        if (gChordTimerRef.current) {
          window.clearTimeout(gChordTimerRef.current);
        }
        gChordTimerRef.current = window.setTimeout(() => {
          gChordActiveRef.current = false;
        }, 900);
        return;
      }

      // C -> New Issue
      if (e.key.toLowerCase() === 'c' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setCreateIssueListId(undefined);
        setCreateIssueOpen(true);
        return;
      }

      // F -> Focus Filter Input on Board View
      if (e.key.toLowerCase() === 'f' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        if (activeView !== 'board_detail') {
          setActiveView('board_detail');
          setTimeout(() => filterInputRef.current?.focus(), 60);
        } else {
          filterInputRef.current?.focus();
        }
        return;
      }

      // ? -> Toggle Shortcuts Help Modal
      if (e.key === '?') {
        e.preventDefault();
        setShortcutsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeView,
    commandPaletteOpen,
    createIssueOpen,
    createBoardOpen,
    shortcutsOpen,
    inspectedIssueId,
    setInspectedIssueId,
  ]);

  const handleOpenBoard = (boardId: string) => {
    setActiveBoardId(boardId);
    setActiveView('board_detail');
  };

  return (
    <AppShell
      activeView={activeView}
      onSelectView={setActiveView}
      onOpenCommandPalette={() => setCommandPaletteOpen(true)}
      onOpenNewIssue={() => {
        setCreateIssueListId(undefined);
        setCreateIssueOpen(true);
      }}
      onOpenNewBoard={() => setCreateBoardOpen(true)}
      shortcutsOpen={shortcutsOpen}
      setShortcutsOpen={setShortcutsOpen}
      theme={theme}
      onToggleTheme={onToggleTheme}
    >
      <div className="flex h-full min-h-0 overflow-hidden relative">
        {/* Main Viewport Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {inviteBannerMessage && (
            <div className="mx-6 mt-4 px-4 py-2.5 rounded-[var(--radius-sm)] bg-[var(--accent-tint)] border border-[var(--accent-primary)]/40 text-[var(--text-primary)] text-[13px] flex items-center justify-between gap-3">
              <span>{inviteBannerMessage}</span>
              <button
                type="button"
                onClick={() => setInviteBannerMessage(null)}
                className="text-[12px] text-[var(--accent-primary)] hover:underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}
          {activeView === 'boards' && (
            <BoardsOverviewScreen
              onOpenBoard={handleOpenBoard}
              onOpenNewBoardModal={() => setCreateBoardOpen(true)}
            />
          )}

          {activeView === 'board_detail' && (
            <KanbanBoardScreen
              filterInputRef={filterInputRef}
              onOpenNewIssueModal={(listId) => {
                setCreateIssueListId(listId);
                setCreateIssueOpen(true);
              }}
            />
          )}

          {activeView === 'my_issues' && (
            <MyIssuesScreen
              onOpenBoardIssue={(boardId, issueId) => {
                setActiveBoardId(boardId);
                setInspectedIssueId(issueId);
                setActiveView('board_detail');
              }}
              onOpenNewIssue={() => {
                setCreateIssueListId(undefined);
                setCreateIssueOpen(true);
              }}
            />
          )}

          {activeView === 'activity' && (
            <ActivityFeedScreen onOpenBoard={handleOpenBoard} />
          )}

          {activeView === 'members' && <MembersAndInvitesScreen />}
        </div>

        {/* Full Right-Side Issue Detail Panel */}
        <IssueDetailPanel />
      </div>

      {/* Global Modals: Command Palette, Create Issue, Create Board with Templates */}
      <CommandPaletteModal
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onOpenBoard={handleOpenBoard}
        onOpenNewIssue={() => {
          setCreateIssueListId(undefined);
          setCreateIssueOpen(true);
        }}
        onOpenNewBoard={() => setCreateBoardOpen(true)}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />

      <CreateIssueModal
        isOpen={createIssueOpen}
        defaultListId={createIssueListId}
        onClose={() => setCreateIssueOpen(false)}
        onCreatedIssue={(boardId, issueId) => {
          setActiveBoardId(boardId);
          setInspectedIssueId(issueId);
          setActiveView('board_detail');
        }}
      />

      <CreateBoardModal
        isOpen={createBoardOpen}
        onClose={() => setCreateBoardOpen(false)}
        onCreatedBoard={(boardId) => {
          setActiveBoardId(boardId);
          setActiveView('board_detail');
        }}
      />
    </AppShell>
  );
}

function AuthenticatedGate({
  theme,
  onToggleTheme,
}: {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-screen bg-[var(--bg-canvas)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 rounded-full border-2 border-[var(--accent-primary)] border-t-transparent animate-spin" />
          <span className="text-[13px] text-[var(--text-muted)]">
            Loading Team Boards workspace...
          </span>
        </div>
      </div>
    );
  }

  if (!user && !profile) {
    return <AuthScreen theme={theme} onToggleTheme={onToggleTheme} />;
  }

  return (
    <TeamBoardsProvider>
      <TeamBoardsWorkspaceContent theme={theme} onToggleTheme={onToggleTheme} />
    </TeamBoardsProvider>
  );
}

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthenticatedGate theme={theme} onToggleTheme={toggleTheme} />
      </AuthProvider>
    </QueryClientProvider>
  );
}
