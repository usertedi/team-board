import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Activity,
  Users,
  Link2,
  Check,
  Shield,
  Calendar,
  ArrowUpRight,
} from 'lucide-react';
import { useTeamBoards } from '../contexts/TeamBoardsContext';
import { useAuth } from '../contexts/AuthContext';
import {
  MemberRole,
  IssuePriority,
  PRIORITY_META,
} from '../types/teamBoards';
import { PrioritySignal } from './KanbanBoardScreen';
import { UserAvatar, Kbd } from './BrandAndPrimitives';

/**
 * My Issues Screen (Assigned to current user)
 */
export const MyIssuesScreen: React.FC<{
  onOpenBoardIssue: (boardId: string, issueId: string) => void;
  onOpenNewIssue: () => void;
}> = ({ onOpenBoardIssue, onOpenNewIssue }) => {
  const {
    issues,
    boards,
    lists,
    labels,
    canEdit,
    inspectedIssueId,
    updateIssue,
  } = useTeamBoards();
  const { profile, user } = useAuth();
  const currentUserId = profile?.uid || user?.uid || 'usr-demo-elena';

  const [priorityFilter, setPriorityFilter] = useState<IssuePriority | 'all'>(
    'all'
  );

  const myIssues = issues.filter((i) => {
    if (i.assigneeId !== currentUserId) return false;
    if (priorityFilter !== 'all' && i.priority !== priorityFilter) return false;
    return true;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <h1 className="text-[20px] leading-[28px] font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-[var(--accent-primary)]" />
            <span>My Issues ({myIssues.length})</span>
          </h1>
          <p className="text-[14px] text-[var(--text-secondary)]">
            Issues assigned directly to you across all workspace teams and boards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            aria-label="Filter My Issues by Priority"
            value={priorityFilter}
            onChange={(e) =>
              setPriorityFilter(e.target.value as IssuePriority | 'all')
            }
            className="h-9 px-3 rounded-[var(--radius-sm)] bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] text-[13px] font-medium text-[var(--text-secondary)] outline-none cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {canEdit && (
            <button
              type="button"
              onClick={onOpenNewIssue}
              className="h-9 px-3.5 rounded-[var(--radius-sm)] bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white text-[13px] font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Issue</span>
            </button>
          )}
        </div>
      </div>

      {myIssues.length === 0 ? (
        <div className="p-10 rounded-[var(--radius-md)] border border-dashed border-[var(--border-strong)] text-center space-y-3">
          <div className="text-[16px] font-semibold text-[var(--text-primary)]">
            No issues assigned to you
          </div>
          <p className="text-[14px] text-[var(--text-muted)] max-w-md mx-auto">
            You’re all caught up! Create a new issue or assign an existing card to yourself from any board.
          </p>
          {canEdit && (
            <button
              type="button"
              onClick={onOpenNewIssue}
              className="h-9 px-4 rounded-[var(--radius-sm)] bg-[var(--accent-primary)] text-white text-[13px] font-medium inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Issue</span>
            </button>
          )}
        </div>
      ) : (
        <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] divide-y divide-[var(--border-subtle)] overflow-hidden">
          {myIssues.map((issue) => {
            const board = boards.find((b) => b.id === issue.boardId);
            const list = lists.find((l) => l.id === issue.listId);
            const issueLabels = labels.filter((l) =>
              issue.labelIds.includes(l.id)
            );
            const isSelected = inspectedIssueId === issue.id;

            return (
              <div
                key={issue.id}
                onClick={() => onOpenBoardIssue(issue.boardId, issue.id)}
                className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--bg-selected)]'
                    : 'hover:bg-[var(--bg-surface-2)]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <PrioritySignal priority={issue.priority} />
                  <span className="font-mono-id text-[13px] font-semibold text-[var(--accent-primary)] w-16 shrink-0">
                    {issue.identifier}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-medium text-[var(--text-primary)] truncate">
                      {issue.title}
                    </div>
                    <div className="text-[12px] text-[var(--text-muted)] flex items-center gap-2 mt-0.5">
                      <span>{board?.title}</span>
                      <span>·</span>
                      <span className="text-[var(--text-secondary)] font-medium">
                        {list?.title}
                      </span>
                      {issue.dueDate && (
                        <>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1 font-mono-id">
                            <Calendar className="w-3 h-3" />
                            Due {issue.dueDate}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {issueLabels.map((lbl) => (
                    <span
                      key={lbl.id}
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] text-[12px] text-[var(--text-secondary)]"
                    >
                      <span
                        style={{ backgroundColor: lbl.color }}
                        className="w-2 h-2 rounded-full"
                      />
                      <span>{lbl.name}</span>
                    </span>
                  ))}

                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center"
                  >
                    <select
                      aria-label={`Change priority for ${issue.identifier}`}
                      disabled={!canEdit}
                      value={issue.priority}
                      onChange={(e) =>
                        updateIssue(issue.id, {
                          priority: e.target.value as IssuePriority,
                        })
                      }
                      className="h-7 px-2 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] text-[12px] text-[var(--text-secondary)] outline-none cursor-pointer"
                    >
                      {Object.entries(PRIORITY_META).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <span className="font-mono-id text-[12px] text-[var(--text-muted)] w-10 text-right">
                    {issue.estimate}pt
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)]" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/**
 * Workspace-Wide Activity Feed Screen
 */
export const ActivityFeedScreen: React.FC<{
  onOpenBoard: (boardId: string) => void;
}> = ({ onOpenBoard }) => {
  const { activity, openIssueByIdentifier } = useTeamBoards();

  return (
    <div className="p-6 max-w-4xl mx-auto w-full space-y-6">
      <div className="pb-4 border-b border-[var(--border-subtle)]">
        <h1 className="text-[20px] leading-[28px] font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <Activity className="w-5 h-5 text-[var(--accent-primary)]" />
          <span>Workspace Activity Log ({activity.length})</span>
        </h1>
        <p className="text-[14px] text-[var(--text-secondary)]">
          Real-time audit log of issue creations, column transitions, priority/assignee updates, and comments.
        </p>
      </div>

      <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] divide-y divide-[var(--border-subtle)]">
        {activity.map((act) => (
          <div
            key={act.id}
            onClick={() => {
              if (act.issueIdentifier) {
                openIssueByIdentifier(act.issueIdentifier);
              } else if (act.boardId) {
                onOpenBoard(act.boardId);
              }
            }}
            className="p-4 flex items-center justify-between gap-4 hover:bg-[var(--bg-surface-2)] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <UserAvatar
                displayName={act.actorName}
                initials={act.actorInitials}
                color={act.actorColor}
                size="md"
              />
              <div className="min-w-0">
                <div className="text-[14px] text-[var(--text-primary)]">
                  <span className="font-semibold">{act.actorName}</span>{' '}
                  <span className="text-[var(--text-secondary)]">
                    {act.action}
                  </span>
                </div>
                <div className="text-[13px] text-[var(--text-muted)] truncate">
                  {act.detail}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {act.issueIdentifier && (
                <Kbd>{act.issueIdentifier}</Kbd>
              )}
              <span className="font-mono-id text-[12px] text-[var(--text-muted)]">
                {act.createdAt}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Members, RBAC Roles & Invite Links Screen
 */
export const MembersAndInvitesScreen: React.FC = () => {
  const {
    activeWorkspace,
    members,
    invites,
    currentUserRole,
    isAdminOrOwner,
    setMySimRole,
    updateMemberRole,
    createInvite,
    acceptInviteToken,
  } = useTeamBoards();

  const [inviteRole, setInviteRole] = useState<MemberRole>('member');
  const [latestInviteLink, setLatestInviteLink] = useState<string | null>(null);
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);
  const [acceptInput, setAcceptInput] = useState('');
  const [acceptStatus, setAcceptStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleGenerateInvite = () => {
    const inv = createInvite(inviteRole);
    const link = `${window.location.origin}/?invite=${inv.token}`;
    setLatestInviteLink(link);
    navigator.clipboard?.writeText(link);
    setCopiedTokenId(inv.id);
    setTimeout(() => setCopiedTokenId(null), 2000);
  };

  const handleCopyExistingInvite = (id: string, token: string) => {
    const link = `${window.location.origin}/?invite=${token}`;
    navigator.clipboard?.writeText(link);
    setCopiedTokenId(id);
    setTimeout(() => setCopiedTokenId(null), 2000);
  };

  const handleAcceptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptInput.trim()) return;
    const res = acceptInviteToken(acceptInput);
    setAcceptStatus(res);
    if (res.success) {
      setAcceptInput('');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto w-full space-y-8">
      {/* Header & Role Verification Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <h1 className="text-[20px] leading-[28px] font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Users className="w-5 h-5 text-[var(--accent-primary)]" />
            <span>Workspace Members & Invites</span>
          </h1>
          <p className="text-[14px] text-[var(--text-secondary)]">
            Manage roles (`owner`, `admin`, `member`, `viewer`) and generate tokenized invite links.
          </p>
        </div>

        {/* Interactive Role Switcher so User can test Viewer Read-Only Lock vs Owner/Admin */}
        <div className="p-3 rounded-[var(--radius-md)] bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--text-secondary)]">
            <Shield className="w-4 h-4 text-[var(--accent-primary)]" />
            <span>Your Active Role:</span>
          </div>
          <select
            aria-label="Test your active role permissions"
            value={currentUserRole}
            onChange={(e) => setMySimRole(e.target.value as MemberRole)}
            className="h-8 px-2.5 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] border border-[var(--border-strong)] text-[13px] font-semibold text-[var(--text-primary)] uppercase outline-none cursor-pointer"
          >
            <option value="owner">Owner (Full Access)</option>
            <option value="admin">Admin (Manage Members)</option>
            <option value="member">Member (Create/Edit Issues)</option>
            <option value="viewer">Viewer (Read-Only Mode)</option>
          </select>
        </div>
      </div>

      {/* Invite Link Generator & Token Acceptance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create Copyable Invite Link */}
        <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] p-5 space-y-4">
          <div className="space-y-1">
            <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">
              Create Invite Token Link
            </h2>
            <p className="text-[13px] text-[var(--text-secondary)]">
              Generate a copyable invite link with a pre-assigned role for{' '}
              <strong>{activeWorkspace.name}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              aria-label="Role for invited member"
              disabled={!isAdminOrOwner}
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as MemberRole)}
              className="h-9 px-3 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] text-[13px] text-[var(--text-primary)] outline-none cursor-pointer"
            >
              <option value="admin">Role: Admin</option>
              <option value="member">Role: Member</option>
              <option value="viewer">Role: Viewer (Read-Only)</option>
            </select>

            <button
              type="button"
              disabled={!isAdminOrOwner}
              onClick={handleGenerateInvite}
              className="flex-1 h-9 px-4 rounded-[var(--radius-sm)] bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white text-[13px] font-medium flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
            >
              <Link2 className="w-4 h-4" />
              <span>Generate & Copy Link</span>
            </button>
          </div>

          {latestInviteLink && (
            <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] border border-[var(--accent-primary)]/40 space-y-1">
              <div className="text-[12px] font-medium text-[var(--status-done)] flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>Invite link copied to clipboard!</span>
              </div>
              <code className="block font-mono-id text-[12px] text-[var(--text-primary)] break-all">
                {latestInviteLink}
              </code>
            </div>
          )}

          {/* Active Invite Tokens List */}
          <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
            <div className="text-[12px] font-medium text-[var(--text-muted)]">
              Active Invite Tokens ({invites.length})
            </div>
            {invites.map((inv) => (
              <div
                key={inv.id}
                className="p-2.5 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] flex items-center justify-between gap-2 text-[12px]"
              >
                <div className="min-w-0">
                  <div className="font-mono-id text-[var(--text-primary)] font-medium truncate">
                    {inv.token}
                  </div>
                  <div className="text-[var(--text-muted)]">
                    Role: <span className="uppercase">{inv.role}</span> · Created{' '}
                    {inv.createdAt}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyExistingInvite(inv.id, inv.token)}
                  className="h-7 px-2.5 rounded-[var(--radius-sm)] bg-[var(--bg-surface-1)] hover:bg-[var(--bg-surface-3)] border border-[var(--border-subtle)] text-[var(--text-secondary)] flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  {copiedTokenId === inv.id ? (
                    <>
                      <Check className="w-3 h-3 text-[var(--status-done)]" />
                      <span className="text-[var(--status-done)]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Link2 className="w-3 h-3" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Accept Invite Token Box */}
        <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] p-5 space-y-4">
          <div className="space-y-1">
            <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">
              Accept an Invite Link or Token
            </h2>
            <p className="text-[13px] text-[var(--text-secondary)]">
              Paste an invite link or token (e.g.,{' '}
              <code className="font-mono-id text-[12px]">
                tb_inv_9f8a7d6c5b4e
              </code>
              ) to join with the invited role.
            </p>
          </div>

          <form onSubmit={handleAcceptSubmit} className="space-y-3">
            <input
              type="text"
              value={acceptInput}
              onChange={(e) => setAcceptInput(e.target.value)}
              placeholder="Paste invite URL or token (tb_inv_...)..."
              aria-label="Invite link or token"
              className="w-full h-9 px-3 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] font-mono-id text-[13px] text-[var(--text-primary)] outline-none"
            />
            <button
              type="submit"
              className="w-full h-9 px-4 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] border border-[var(--border-strong)] text-[var(--text-primary)] text-[13px] font-medium cursor-pointer"
            >
              Accept Invite Token
            </button>
          </form>

          {acceptStatus && (
            <div
              className={`p-3 rounded-[var(--radius-sm)] text-[13px] border ${
                acceptStatus.success
                  ? 'bg-[var(--status-done)]/10 border-[var(--status-done)]/40 text-[var(--status-done)]'
                  : 'bg-[#EB5757]/10 border-[#EB5757]/40 text-[#EB5757]'
              }`}
            >
              {acceptStatus.message}
            </div>
          )}
        </div>
      </div>

      {/* Workspace Members Table */}
      <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <span className="text-[14px] font-semibold text-[var(--text-primary)]">
            Workspace Directory ({members.length} members)
          </span>
          <span className="text-[12px] text-[var(--text-muted)]">
            Row-Level Security enforced
          </span>
        </div>

        <div className="divide-y divide-[var(--border-subtle)]">
          {members.map((m) => (
            <div
              key={m.userId}
              className="px-5 py-3.5 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <UserAvatar
                  displayName={m.displayName}
                  initials={m.initials}
                  color={m.color}
                  size="md"
                />
                <div>
                  <div className="text-[14px] font-medium text-[var(--text-primary)]">
                    {m.displayName}
                  </div>
                  <div className="text-[12px] text-[var(--text-muted)]">
                    {m.title || 'Workspace Member'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <select
                  aria-label={`Change role for ${m.displayName}`}
                  disabled={!isAdminOrOwner}
                  value={m.role}
                  onChange={(e) =>
                    updateMemberRole(m.userId, e.target.value as MemberRole)
                  }
                  className="h-8 px-2.5 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] font-mono-id text-[12px] uppercase text-[var(--text-primary)] outline-none cursor-pointer disabled:opacity-60"
                >
                  <option value="owner">OWNER</option>
                  <option value="admin">ADMIN</option>
                  <option value="member">MEMBER</option>
                  <option value="viewer">VIEWER</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
