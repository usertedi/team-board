import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Circle,
  FolderKanban,
  Plus,
  Users,
  Pin,
  Columns,
  Keyboard,
  Shield,
  Sparkles,
  X,
  ArrowRight,
} from 'lucide-react';
import { useTeamBoards } from '../contexts/TeamBoardsContext';
import { Kbd } from './BrandAndPrimitives';
import { ShellView } from './AppShell';

/**
 * Interactive Getting Started Checklist Card (shown on Boards Overview for new users)
 */
export const GettingStartedGuideBanner: React.FC<{
  onOpenNewBoardModal: () => void;
  onOpenNewIssueModal: () => void;
  onNavigateView: (view: ShellView) => void;
  onOpenFullGuide: () => void;
}> = ({
  onOpenNewBoardModal,
  onOpenNewIssueModal,
  onNavigateView,
  onOpenFullGuide,
}) => {
  const { boards, issues, pins, invites, members } = useTeamBoards();
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('tb_hide_getting_started') === 'true';
    } catch {
      return false;
    }
  });

  if (dismissed) return null;

  const hasBoard = boards.filter((b) => !b.archived).length > 0;
  const hasIssue = issues.length > 0;
  const hasPinned = pins.length > 0;
  const hasCollaborated = invites.length > 0 || members.length > 1;

  const steps = [
    {
      id: 'step-board',
      done: hasBoard,
      title: '1. Create your first Board',
      desc: 'Choose a Kanban, Milestone/Campaign, or Requests template to pre-build your workflow columns.',
      actionLabel: hasBoard ? 'Add another board' : 'Create Board',
      onClick: onOpenNewBoardModal,
    },
    {
      id: 'step-issue',
      done: hasIssue,
      title: '2. Add an Issue or Task Card',
      desc: 'Create a card (Shortcut C) with priority, due date, estimate points, and colored labels.',
      actionLabel: hasIssue ? 'New Issue (C)' : 'Create First Issue',
      onClick: onOpenNewIssueModal,
    },
    {
      id: 'step-pin',
      done: hasPinned,
      title: '3. Pin a Board to your Sidebar',
      desc: 'Click the pin icon on any board card so it stays docked in your left navigation.',
      actionLabel: 'Open Active Board',
      onClick: () => onNavigateView('board_detail'),
    },
    {
      id: 'step-invite',
      done: hasCollaborated,
      title: '4. Invite Teammates or Join a Team',
      desc: 'Generate a copyable invite link with Owner, Admin, Member, or Viewer permissions.',
      actionLabel: 'Members & Invites',
      onClick: () => onNavigateView('members'),
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const pct = Math.round((completedCount / steps.length) * 100);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem('tb_hide_getting_started', 'true');
    } catch {
      // ignore
    }
  };

  return (
    <section
      aria-label="Getting Started Platform Guide"
      className="bg-[var(--bg-surface-1)] border border-[var(--accent-primary)]/40 rounded-[var(--radius-lg)] p-5 space-y-4 shadow-sm"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-[var(--radius-sm)] bg-[var(--accent-tint)] text-[var(--accent-primary)] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">
              Welcome to Team Boards — Quick Start Guide
            </h2>
            <span className="px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] font-mono-id text-[12px] text-[var(--text-secondary)]">
              {completedCount}/{steps.length} completed ({pct}%)
            </span>
          </div>
          <p className="text-[13px] text-[var(--text-secondary)]">
            Follow these 4 steps to set up your workspace, or open the interactive platform walkthrough anytime.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenFullGuide}
            className="h-8 px-3 rounded-[var(--radius-sm)] bg-[var(--accent-tint)] hover:opacity-90 text-[var(--accent-primary)] text-[12px] font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Open Full Platform Guide</span>
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss quick start guide"
            title="Hide quick start banner"
            className="h-8 px-2.5 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] text-[12px] text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`p-3.5 rounded-[var(--radius-md)] border flex flex-col justify-between gap-3 transition-colors ${
              step.done
                ? 'bg-[var(--bg-surface-2)]/60 border-[var(--status-done)]/40'
                : 'bg-[var(--bg-surface-2)] border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
            }`}
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] font-semibold text-[var(--text-primary)]">
                  {step.title}
                </span>
                {step.done ? (
                  <CheckCircle2 className="w-4 h-4 text-[var(--status-done)] shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                )}
              </div>
              <p className="text-[12px] leading-[17px] text-[var(--text-muted)]">
                {step.desc}
              </p>
            </div>

            <button
              type="button"
              onClick={step.onClick}
              className="h-8 px-2.5 rounded-[var(--radius-sm)] bg-[var(--bg-surface-1)] hover:bg-[var(--bg-surface-3)] border border-[var(--border-subtle)] text-[12px] font-medium text-[var(--text-primary)] flex items-center justify-between gap-1.5 transition-colors cursor-pointer"
            >
              <span>{step.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

/**
 * Full Interactive Platform Guide Modal (Accessible from Sidebar, Top Bar, or Command Palette)
 */
export const PlatformGuideModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onOpenNewBoard: () => void;
  onOpenNewIssue: () => void;
  onNavigateView: (view: ShellView) => void;
}> = ({
  isOpen,
  onClose,
  onOpenNewBoard,
  onOpenNewIssue,
  onNavigateView,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'boards' | 'collaboration' | 'shortcuts'
  >('overview');

  if (!isOpen) return null;

  const tabs = [
    {
      id: 'overview' as const,
      label: '1. Workspaces & Teams',
      icon: <FolderKanban className="w-4 h-4" />,
    },
    {
      id: 'boards' as const,
      label: '2. Boards, Cards & Drag-Drop',
      icon: <Columns className="w-4 h-4" />,
    },
    {
      id: 'collaboration' as const,
      label: '3. Roles & Invite Links',
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'shortcuts' as const,
      label: '4. Keyboard Shortcuts',
      icon: <Keyboard className="w-4 h-4" />,
    },
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/65 flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="platform-guide-title"
        className="w-full max-w-[680px] bg-[var(--bg-surface-1)] border border-[var(--border-strong)] rounded-[var(--radius-lg)] shadow-2xl overflow-hidden flex flex-col max-h-[88dvh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--accent-tint)] text-[var(--accent-primary)] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </span>
            <div>
              <h2
                id="platform-guide-title"
                className="text-[16px] font-semibold text-[var(--text-primary)]"
              >
                How to Use Team Boards — Platform Guide
              </h2>
              <p className="text-[12px] text-[var(--text-muted)]">
                Built for teams of any background: creative studios, event operations, research, or product.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close platform guide"
            className="h-8 px-2.5 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] text-[var(--text-secondary)] flex items-center gap-1 cursor-pointer"
          >
            <Kbd>Esc</Kbd>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Tabs */}
        <div className="px-6 pt-3 bg-[var(--bg-surface-2)]/50 border-b border-[var(--border-subtle)] flex flex-wrap gap-1.5 shrink-0">
          {tabs.map((t) => {
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`h-9 px-3 rounded-t-[var(--radius-sm)] text-[13px] font-medium flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                  active
                    ? 'border-[var(--accent-primary)] text-[var(--text-primary)] bg-[var(--bg-surface-1)]'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Guide Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-[14px] leading-[21px] text-[var(--text-secondary)]">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <h3 className="text-[16px] font-semibold text-[var(--text-primary)]">
                Organizing Workspaces, Teams & Templates
              </h3>
              <p>
                Every new account starts with a clean personal workspace so you never have to clean up unrelated demo items. Here is how your hierarchy works:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-[var(--radius-md)] bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] space-y-1.5">
                  <div className="text-[14px] font-semibold text-[var(--text-primary)] flex items-center gap-2">
                    <FolderKanban className="w-4 h-4 text-[var(--accent-primary)]" />
                    <span>Workspaces & Teams</span>
                  </div>
                  <p className="text-[13px] text-[var(--text-muted)]">
                    Use the top-left switcher to create additional Workspaces. Inside a workspace, create <strong>Teams</strong> with short 3-letter keys (like <code className="font-mono-id">MKT</code>, <code className="font-mono-id">OPS</code>, or <code className="font-mono-id">DES</code>) which automatically number your cards (<code className="font-mono-id">MKT-1</code>, <code className="font-mono-id">MKT-2</code>).
                  </p>
                </div>

                <div className="p-4 rounded-[var(--radius-md)] bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] space-y-1.5">
                  <div className="text-[14px] font-semibold text-[var(--text-primary)] flex items-center gap-2">
                    <Pin className="w-4 h-4 text-[var(--accent-primary)]" />
                    <span>3 Ready-Made Board Templates</span>
                  </div>
                  <p className="text-[13px] text-[var(--text-muted)]">
                    When creating a board, pick <strong>Kanban Workflow</strong>, <strong>Milestone / Campaign</strong>, or <strong>Requests & Intake</strong> to pre-create workflow lists automatically.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-[var(--radius-md)] bg-[var(--accent-tint)] border border-[var(--accent-primary)]/30 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="text-[13px] font-semibold text-[var(--text-primary)]">
                    Ready to create a board?
                  </div>
                  <div className="text-[12px] text-[var(--text-secondary)]">
                    Launch the New Board modal to pick a team prefix and workflow template.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenNewBoard();
                  }}
                  className="h-9 px-3.5 rounded-[var(--radius-sm)] bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white text-[13px] font-medium flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Board</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'boards' && (
            <div className="space-y-4">
              <h3 className="text-[16px] font-semibold text-[var(--text-primary)]">
                Working with Kanban Columns, Cards & the Side Inspector
              </h3>
              <ul className="space-y-2.5 text-[13px]">
                <li className="p-3 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] border border-[var(--border-subtle)]">
                  <strong className="text-[var(--text-primary)]">Drag & Drop or Keyboard Move:</strong>{' '}
                  Drag any card between columns or use the <code className="font-mono-id">←</code> / <code className="font-mono-id">→</code> arrows on the card to move it with your keyboard.
                </li>
                <li className="p-3 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] border border-[var(--border-subtle)]">
                  <strong className="text-[var(--text-primary)]">Right-Side Issue Detail Panel:</strong>{' '}
                  Click any card to open the full right-hand inspector. Edit Markdown descriptions, change priority/status/assignee, create custom colored labels, post comments, or copy a shareable link (<code className="font-mono-id">/boards/:id/issues/:number</code>). Press <Kbd>Esc</Kbd> to close.
                </li>
                <li className="p-3 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] border border-[var(--border-subtle)]">
                  <strong className="text-[var(--text-primary)]">Real-Time Progress & Grouping:</strong>{' '}
                  Toggle board grouping between <strong>Status List</strong> and <strong>Assignee</strong>. Moving cards into the final <strong>Done / Completed</strong> column automatically updates the board’s progress bar on the Overview screen.
                </li>
              </ul>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenNewIssue();
                  }}
                  className="h-9 px-3.5 rounded-[var(--radius-sm)] bg-[var(--accent-primary)] text-white text-[13px] font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create an Issue Card (C)</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'collaboration' && (
            <div className="space-y-4">
              <h3 className="text-[16px] font-semibold text-[var(--text-primary)]">
                Inviting Collaborators & Role Permissions
              </h3>
              <p className="text-[13px]">
                You only see workspaces and boards you created or were invited into. Use <strong>Members & Invites</strong> in the left sidebar to collaborate:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
                <div className="p-3.5 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] space-y-1">
                  <div className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-[var(--accent-primary)]" />
                    <span>4 Access Roles</span>
                  </div>
                  <p className="text-[12px] text-[var(--text-muted)]">
                    <strong>Owner</strong> & <strong>Admin</strong> manage members and invites. <strong>Member</strong> creates and edits boards/cards. <strong>Viewer</strong> has strict read-only access enforced by database security rules.
                  </p>
                </div>

                <div className="p-3.5 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] space-y-1">
                  <div className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#27C383]" />
                    <span>Copyable Invite Tokens</span>
                  </div>
                  <p className="text-[12px] text-[var(--text-muted)]">
                    Generate a shareable link (<code className="font-mono-id">?invite=tb_inv_...</code>) or paste a teammate’s token (try <code className="font-mono-id">tb_inv_9f8a7d6c5b4e</code> to join the Horizon Collective demo workspace!).
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateView('members');
                  }}
                  className="h-9 px-3.5 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] border border-[var(--border-strong)] text-[var(--text-primary)] text-[13px] font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <Users className="w-4 h-4 text-[var(--accent-primary)]" />
                  <span>Go to Members & Invites</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'shortcuts' && (
            <div className="space-y-4">
              <h3 className="text-[16px] font-semibold text-[var(--text-primary)]">
                Speed Up with Keyboard Navigation
              </h3>
              <p className="text-[13px]">
                All single-key shortcuts are automatically disabled while typing inside inputs, search boxes, or comments.
              </p>
              <div className="bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] divide-y divide-[var(--border-subtle)] text-[13px]">
                {[
                  { label: 'Open Command Palette (jump to board/issue, toggle theme)', keys: '⌘ K / Ctrl K' },
                  { label: 'Create a New Issue Card from anywhere', keys: 'C' },
                  { label: 'Focus the Board Filter / Search input', keys: 'F' },
                  { label: 'Jump back to Boards Overview', keys: 'G then B' },
                  { label: 'Open Keyboard Shortcuts Reference', keys: '?' },
                  { label: 'Close Issue Detail Panel or Active Modal', keys: 'Esc' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="px-4 py-2.5 flex items-center justify-between gap-4"
                  >
                    <span className="text-[var(--text-primary)]">{item.label}</span>
                    <Kbd>{item.keys}</Kbd>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[var(--bg-surface-2)]/60 border-t border-[var(--border-subtle)] flex items-center justify-between shrink-0">
          <span className="text-[12px] text-[var(--text-muted)]">
            Tip: Press <Kbd>⌘K</Kbd> anytime to search boards, issues, or actions.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-4 rounded-[var(--radius-sm)] bg-[var(--accent-primary)] text-white text-[13px] font-medium cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
