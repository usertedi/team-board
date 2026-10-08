import React, { useState } from 'react';
import {
  X,
  Link2,
  Check,
  Trash2,
  Plus,
  Send,
  Edit2,
  Clock,
  Tag,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useTeamBoards } from '../contexts/TeamBoardsContext';
import { useAuth } from '../contexts/AuthContext';
import { IssuePriority, PRIORITY_META } from '../types/teamBoards';
import { PrioritySignal } from './KanbanBoardScreen';
import { UserAvatar, Kbd } from './BrandAndPrimitives';

export const IssueDetailPanel: React.FC = () => {
  const {
    issues,
    lists,
    members,
    labels,
    comments,
    activity,
    canEdit,
    inspectedIssueId,
    setInspectedIssueId,
    updateIssue,
    moveIssueOptimistic,
    deleteIssue,
    createLabel,
    addComment,
    updateComment,
    deleteComment,
  } = useTeamBoards();
  const { profile, user } = useAuth();
  const currentUserId = profile?.uid || user?.uid || 'usr-demo-elena';

  const issue = issues.find((i) => i.id === inspectedIssueId);

  const [copiedLink, setCopiedLink] = useState(false);
  const [commentBody, setCommentBody] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [showNewLabelForm, setShowNewLabelForm] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#5E6AD2');

  if (!issue) return null;

  const boardLists = lists
    .filter((l) => l.boardId === issue.boardId)
    .sort((a, b) => a.position - b.position);
  const currentListIndex = boardLists.findIndex((l) => l.id === issue.listId);

  const issueComments = comments.filter((c) => c.issueId === issue.id);
  const issueActivity = activity.filter((a) => a.issueId === issue.id);

  const handleCopyShareLink = () => {
    const shareUrl = `${window.location.origin}/boards/${issue.boardId}/issues/${issue.identifier}`;
    navigator.clipboard?.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 1800);
  };

  const handleToggleLabel = (labelId: string) => {
    if (!canEdit) return;
    const exists = issue.labelIds.includes(labelId);
    const nextLabels = exists
      ? issue.labelIds.filter((id) => id !== labelId)
      : [...issue.labelIds, labelId];
    const lbl = labels.find((l) => l.id === labelId);
    updateIssue(
      issue.id,
      { labelIds: nextLabels },
      {
        action: exists ? 'removed label' : 'added label',
        detail: lbl?.name || labelId,
      }
    );
  };

  const handleCreateNewLabel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabelName.trim() || !canEdit) return;
    const created = createLabel(newLabelName.trim(), newLabelColor);
    updateIssue(issue.id, {
      labelIds: [...issue.labelIds, created.id],
    });
    setNewLabelName('');
    setShowNewLabelForm(false);
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentBody.trim() || !canEdit) return;
    addComment(issue.id, commentBody);
    setCommentBody('');
  };

  const handleSaveCommentEdit = (commentId: string) => {
    if (!editingCommentText.trim()) return;
    updateComment(commentId, editingCommentText);
    setEditingCommentId(null);
  };

  const handleMoveAdjacentColumn = (dir: -1 | 1) => {
    if (!canEdit) return;
    const targetList = boardLists[currentListIndex + dir];
    if (!targetList) return;
    const targetCards = issues
      .filter((i) => i.listId === targetList.id)
      .sort((a, b) => a.position - b.position);
    const nextPos =
      targetCards.length > 0
        ? targetCards[targetCards.length - 1].position + 1000
        : 1000;
    moveIssueOptimistic(issue.id, targetList.id, nextPos);
  };

  return (
    <aside
      aria-label={`Issue details for ${issue.identifier}`}
      className="w-full sm:w-[440px] lg:w-[480px] bg-[var(--bg-surface-1)] border-l border-[var(--border-subtle)] flex flex-col h-full shrink-0 z-20 select-none"
    >
      {/* Top Panel Bar: Issue ID + Shareable Link Copy + Keyboard Move + Esc Close */}
      <header className="h-[52px] px-4 border-b border-[var(--border-subtle)] flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <PrioritySignal priority={issue.priority} />
          <span className="font-mono-id text-[14px] font-semibold text-[var(--text-primary)]">
            {issue.identifier}
          </span>
          <button
            type="button"
            onClick={handleCopyShareLink}
            aria-label="Copy shareable issue URL"
            title="Copy shareable URL (/boards/:id/issues/:number)"
            className="h-7 px-2 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] border border-[var(--border-subtle)] text-[12px] text-[var(--text-secondary)] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-[var(--status-done)]" />
                <span className="text-[var(--status-done)]">Link copied</span>
              </>
            ) : (
              <>
                <Link2 className="w-3.5 h-3.5" />
                <span>Copy link</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {canEdit && (
            <>
              <button
                type="button"
                disabled={currentListIndex <= 0}
                onClick={() => handleMoveAdjacentColumn(-1)}
                aria-label="Move issue to previous column"
                title="Move to previous column"
                className="w-7 h-7 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={
                  currentListIndex === -1 ||
                  currentListIndex >= boardLists.length - 1
                }
                onClick={() => handleMoveAdjacentColumn(1)}
                aria-label="Move issue to next column"
                title="Move to next column"
                className="w-7 h-7 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => deleteIssue(issue.id)}
                aria-label="Delete issue"
                title="Delete issue"
                className="w-7 h-7 rounded-[var(--radius-sm)] text-[var(--text-muted)] hover:text-[#EB5757] hover:bg-[#EB5757]/10 flex items-center justify-center transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setInspectedIssueId(null)}
            aria-label="Close issue panel"
            title="Close panel (Esc)"
            className="h-7 px-2 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] text-[var(--text-secondary)] flex items-center gap-1 cursor-pointer"
          >
            <Kbd>Esc</Kbd>
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Scrollable Full Panel Body: Title, Markdown Description, Properties, Labels, Comments, Activity */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Title & Markdown Description */}
        <div className="space-y-3">
          <div>
            <label
              htmlFor="issue-title-input"
              className="sr-only"
            >
              Issue Title
            </label>
            <input
              id="issue-title-input"
              type="text"
              disabled={!canEdit}
              value={issue.title}
              onChange={(e) => updateIssue(issue.id, { title: e.target.value })}
              className="w-full text-[18px] leading-[26px] font-semibold text-[var(--text-primary)] bg-transparent focus:bg-[var(--bg-surface-2)] px-2 py-1 -mx-2 rounded-[var(--radius-sm)] outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="issue-desc-input"
              className="block text-[12px] font-medium text-[var(--text-muted)]"
            >
              Description (Markdown)
            </label>
            <textarea
              id="issue-desc-input"
              rows={4}
              disabled={!canEdit}
              value={issue.description}
              onChange={(e) =>
                updateIssue(issue.id, { description: e.target.value })
              }
              placeholder="Write markdown description, acceptance criteria, or notes..."
              className="w-full p-3 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] text-[14px] leading-[20px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none resize-y"
            />
          </div>
        </div>

        {/* Properties Grid: Status (List), Priority, Assignee, Estimate, Due Date */}
        <div className="bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] p-4 space-y-3">
          <div className="text-[12px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Properties
          </div>

          {/* Status (List) */}
          <div className="flex items-center justify-between gap-4">
            <span className="text-[13px] text-[var(--text-secondary)]">
              Status (Column)
            </span>
            <select
              aria-label="Issue Status Column"
              disabled={!canEdit}
              value={issue.listId}
              onChange={(e) => {
                const nextList = boardLists.find(
                  (l) => l.id === e.target.value
                );
                if (nextList) {
                  moveIssueOptimistic(issue.id, nextList.id, issue.position);
                }
              }}
              className="h-8 px-2.5 rounded-[var(--radius-sm)] bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] text-[13px] font-medium text-[var(--text-primary)] outline-none cursor-pointer"
            >
              {boardLists.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div className="flex items-center justify-between gap-4">
            <span className="text-[13px] text-[var(--text-secondary)]">
              Priority
            </span>
            <select
              aria-label="Issue Priority"
              disabled={!canEdit}
              value={issue.priority}
              onChange={(e) => {
                const nextP = e.target.value as IssuePriority;
                updateIssue(
                  issue.id,
                  { priority: nextP },
                  {
                    action: 'changed priority',
                    detail: `to ${PRIORITY_META[nextP].label}`,
                  }
                );
              }}
              className="h-8 px-2.5 rounded-[var(--radius-sm)] bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] text-[13px] font-medium text-[var(--text-primary)] outline-none cursor-pointer"
            >
              {Object.entries(PRIORITY_META).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>

          {/* Assignee */}
          <div className="flex items-center justify-between gap-4">
            <span className="text-[13px] text-[var(--text-secondary)]">
              Assignee
            </span>
            <select
              aria-label="Issue Assignee"
              disabled={!canEdit}
              value={issue.assigneeId || ''}
              onChange={(e) => {
                const nextAssignee = e.target.value || null;
                const memberName =
                  members.find((m) => m.userId === nextAssignee)?.displayName ||
                  'Unassigned';
                updateIssue(
                  issue.id,
                  { assigneeId: nextAssignee },
                  {
                    action: 'changed assignee',
                    detail: `assigned to ${memberName}`,
                  }
                );
              }}
              className="h-8 px-2.5 rounded-[var(--radius-sm)] bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] text-[13px] font-medium text-[var(--text-primary)] outline-none cursor-pointer"
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.displayName} ({m.role})
                </option>
              ))}
            </select>
          </div>

          {/* Estimate Points */}
          <div className="flex items-center justify-between gap-4">
            <span className="text-[13px] text-[var(--text-secondary)]">
              Estimate Points
            </span>
            <select
              aria-label="Estimate Points"
              disabled={!canEdit}
              value={issue.estimate}
              onChange={(e) =>
                updateIssue(issue.id, { estimate: Number(e.target.value) })
              }
              className="h-8 px-2.5 rounded-[var(--radius-sm)] bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] font-mono-id text-[13px] text-[var(--text-primary)] outline-none cursor-pointer"
            >
              {[0, 1, 2, 3, 5, 8, 13].map((pts) => (
                <option key={pts} value={pts}>
                  {pts} pts
                </option>
              ))}
            </select>
          </div>

          {/* Due Date */}
          <div className="flex items-center justify-between gap-4">
            <span className="text-[13px] text-[var(--text-secondary)]">
              Due Date
            </span>
            <input
              type="date"
              aria-label="Due Date"
              disabled={!canEdit}
              value={issue.dueDate || ''}
              onChange={(e) =>
                updateIssue(issue.id, { dueDate: e.target.value || null })
              }
              className="h-8 px-2.5 rounded-[var(--radius-sm)] bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] font-mono-id text-[13px] text-[var(--text-primary)] outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Colored Labels Section */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span>Labels</span>
            </span>
            {canEdit && (
              <button
                type="button"
                onClick={() => setShowNewLabelForm((s) => !s)}
                className="text-[12px] text-[var(--accent-primary)] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New label</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {labels.map((lbl) => {
              const active = issue.labelIds.includes(lbl.id);
              return (
                <button
                  key={lbl.id}
                  type="button"
                  disabled={!canEdit}
                  onClick={() => handleToggleLabel(lbl.id)}
                  className={`h-7 px-2.5 rounded-[var(--radius-sm)] text-[12px] font-medium flex items-center gap-1.5 border transition-colors cursor-pointer ${
                    active
                      ? 'bg-[var(--bg-selected)] border-[var(--accent-primary)] text-[var(--text-primary)]'
                      : 'bg-[var(--bg-surface-2)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <span
                    style={{ backgroundColor: lbl.color }}
                    className="w-2 h-2 rounded-full"
                  />
                  <span>{lbl.name}</span>
                  {active && <Check className="w-3 h-3 text-[var(--accent-primary)]" />}
                </button>
              );
            })}
          </div>

          {showNewLabelForm && canEdit && (
            <form
              onSubmit={handleCreateNewLabel}
              className="p-3 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] flex items-center gap-2"
            >
              <input
                type="color"
                value={newLabelColor}
                onChange={(e) => setNewLabelColor(e.target.value)}
                aria-label="New label color"
                className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
              />
              <input
                type="text"
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                placeholder="Label name..."
                className="flex-1 h-8 px-2.5 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] text-[13px] text-[var(--text-primary)] outline-none"
              />
              <button
                type="submit"
                className="h-8 px-3 rounded-[var(--radius-sm)] bg-[var(--accent-primary)] text-white text-[12px] font-medium cursor-pointer"
              >
                Add
              </button>
            </form>
          )}
        </div>

        {/* Comments Section (Edit & Delete Own Comments) */}
        <div className="space-y-3 pt-3 border-t border-[var(--border-subtle)]">
          <div className="text-[13px] font-semibold text-[var(--text-primary)]">
            Comments ({issueComments.length})
          </div>

          <div className="space-y-2.5">
            {issueComments.length === 0 ? (
              <p className="text-[13px] text-[var(--text-muted)]">
                No comments yet. Share an update with your team below.
              </p>
            ) : (
              issueComments.map((c) => {
                const isOwn = c.authorId === currentUserId;
                const isEditing = editingCommentId === c.id;

                return (
                  <div
                    key={c.id}
                    className="p-3 rounded-[var(--radius-md)] bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <UserAvatar
                          displayName={c.authorName}
                          initials={c.authorInitials}
                          color={c.authorColor}
                          size="sm"
                        />
                        <span className="text-[13px] font-medium text-[var(--text-primary)]">
                          {c.authorName}
                        </span>
                        <span className="font-mono-id text-[12px] text-[var(--text-muted)]">
                          {c.updatedAt}
                        </span>
                      </div>

                      {isOwn && canEdit && !isEditing && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCommentId(c.id);
                              setEditingCommentText(c.body);
                            }}
                            aria-label="Edit your comment"
                            className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteComment(c.id)}
                            aria-label="Delete your comment"
                            className="p-1 text-[var(--text-muted)] hover:text-[#EB5757] cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-2">
                        <textarea
                          rows={2}
                          value={editingCommentText}
                          onChange={(e) =>
                            setEditingCommentText(e.target.value)
                          }
                          className="w-full p-2 rounded-[var(--radius-sm)] bg-[var(--bg-surface-1)] border border-[var(--accent-primary)] text-[14px] text-[var(--text-primary)] outline-none"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingCommentId(null)}
                            className="h-7 px-2.5 text-[12px] text-[var(--text-muted)] cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveCommentEdit(c.id)}
                            className="h-7 px-3 rounded-[var(--radius-sm)] bg-[var(--accent-primary)] text-white text-[12px] font-medium cursor-pointer"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[14px] leading-[20px] text-[var(--text-secondary)] whitespace-pre-wrap">
                        {c.body}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {canEdit && (
            <form onSubmit={handlePostComment} className="flex gap-2">
              <input
                type="text"
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                placeholder="Write a comment..."
                aria-label="Write a comment"
                className="flex-1 h-9 px-3 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none"
              />
              <button
                type="submit"
                className="h-9 px-3.5 rounded-[var(--radius-sm)] bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white text-[13px] font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Comment</span>
              </button>
            </form>
          )}
        </div>

        {/* Per-Issue Activity Log */}
        <div className="space-y-3 pt-3 border-t border-[var(--border-subtle)]">
          <div className="text-[13px] font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span>Issue Activity History</span>
          </div>

          <div className="space-y-2">
            {issueActivity.length === 0 ? (
              <p className="text-[12px] text-[var(--text-muted)]">
                Created {issue.createdAt} · Updated {issue.updatedAt}
              </p>
            ) : (
              issueActivity.map((act) => (
                <div
                  key={act.id}
                  className="flex items-start justify-between gap-2 text-[12px] py-1.5 border-b border-[var(--border-subtle)] last:border-0"
                >
                  <div className="text-[var(--text-secondary)]">
                    <span className="font-medium text-[var(--text-primary)]">
                      {act.actorName}
                    </span>{' '}
                    <span>{act.action}:</span>{' '}
                    <span className="text-[var(--text-muted)]">
                      {act.detail}
                    </span>
                  </div>
                  <span className="font-mono-id text-[12px] text-[var(--text-muted)] shrink-0">
                    {act.createdAt}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
