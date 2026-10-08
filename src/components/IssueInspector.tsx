import React, { useState } from 'react';
import {
  X,
  GitBranch,
  GitPullRequest,
  Plus,
  Send,
  Trash2,
  Check,
  Copy,
} from 'lucide-react';
import { Issue, IssueStatus, IssuePriority } from '../types';
import {
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  TEAM_MEMBERS,
  PROJECTS,
  CYCLES,
} from '../data';
import {
  StatusGlyph,
  PriorityGlyph,
  PrecisionCheckbox,
  MemberAvatar,
  Kbd,
} from './Primitives';

interface IssueInspectorProps {
  issue: Issue | null;
  onClose: () => void;
  onUpdateIssue: (updated: Issue) => void;
  onDeleteIssue: (issueId: string) => void;
}

export const IssueInspector: React.FC<IssueInspectorProps> = ({
  issue,
  onClose,
  onUpdateIssue,
  onDeleteIssue,
}) => {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [commentText, setCommentText] = useState('');
  const [copiedBranch, setCopiedBranch] = useState(false);

  if (!issue) return null;

  const branchSlug =
    issue.branchName ||
    `feature/${issue.id.toLowerCase()}-${issue.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .slice(0, 28)}`;

  const handleCopyBranch = () => {
    navigator.clipboard?.writeText(`git checkout -b ${branchSlug}`);
    setCopiedBranch(true);
    setTimeout(() => setCopiedBranch(false), 1800);
  };

  const handleToggleSubtask = (subtaskId: string) => {
    const updatedSubtasks = issue.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    onUpdateIssue({
      ...issue,
      subtasks: updatedSubtasks,
      updatedAt: 'Just now',
    });
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    const updatedSubtasks = [
      ...issue.subtasks,
      {
        id: `st-${Date.now()}`,
        title: newSubtaskTitle.trim(),
        completed: false,
      },
    ];
    onUpdateIssue({
      ...issue,
      subtasks: updatedSubtasks,
      updatedAt: 'Just now',
    });
    setNewSubtaskTitle('');
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const newActivity = [
      ...issue.activity,
      {
        id: `act-${Date.now()}`,
        authorId: TEAM_MEMBERS[0].id,
        type: 'comment' as const,
        content: commentText.trim(),
        timestamp: 'Just now',
      },
    ];
    onUpdateIssue({
      ...issue,
      activity: newActivity,
      updatedAt: 'Just now',
    });
    setCommentText('');
  };

  return (
    <aside className="w-full sm:w-[400px] lg:w-[420px] bg-[#0C0D0E] border-l border-white/[0.08] flex flex-col h-full shrink-0 z-20 select-none">
      {/* Inspector Top Header */}
      <header className="h-[44px] px-4 border-b border-white/[0.08] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <StatusGlyph status={issue.status} size={13} />
          <span className="font-mono-tabular text-[12px] font-semibold text-[#e3e2e3]">
            {issue.id}
          </span>
          <span className="text-white/20">·</span>
          <span className="text-[11px] text-[#6E7681]">
            Created {issue.createdAt}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              onDeleteIssue(issue.id);
              onClose();
            }}
            title="Delete issue"
            className="w-6 h-6 rounded-[4px] text-[#6E7681] hover:text-[#EB5757] hover:bg-[#EB5757]/10 flex items-center justify-center transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            title="Close Inspector (Esc)"
            className="w-6 h-6 rounded-[4px] text-[#908f9e] hover:text-white hover:bg-white/[0.06] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Scrollable Inspector Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Editable Title & Description */}
        <div className="space-y-2">
          <input
            type="text"
            value={issue.title}
            onChange={(e) =>
              onUpdateIssue({ ...issue, title: e.target.value, updatedAt: 'Just now' })
            }
            className="w-full bg-transparent type-headline-md text-[#e3e2e3] focus:outline-none focus:bg-[#121417] focus:px-2 focus:py-1 rounded-[4px] transition-all"
          />

          <textarea
            rows={3}
            value={issue.description}
            onChange={(e) =>
              onUpdateIssue({
                ...issue,
                description: e.target.value,
                updatedAt: 'Just now',
              })
            }
            placeholder="Add technical specification or reproduction steps..."
            className="w-full bg-[#0E1012] border border-white/[0.08] focus:border-[#5E6AD2] rounded-[4px] p-2.5 type-body-md text-[#c6c5d5] placeholder-[#4E535B] outline-none resize-none"
          />
        </div>

        {/* Structured Properties Matrix */}
        <div className="bg-[#121417] border border-white/[0.06] rounded-[4px] p-3 space-y-2.5">
          {/* Status Row */}
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-[#6E7681]">Status</span>
            <div className="flex items-center gap-1.5">
              <StatusGlyph status={issue.status} size={12} />
              <select
                value={issue.status}
                onChange={(e) =>
                  onUpdateIssue({
                    ...issue,
                    status: e.target.value as IssueStatus,
                    updatedAt: 'Just now',
                  })
                }
                className="h-[26px] px-2 bg-[#0E1012] border border-white/[0.08] focus:border-[#5E6AD2] rounded-[4px] type-label-sm text-[#e3e2e3] outline-none cursor-pointer"
              >
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label} ({v.shortcut})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority Row */}
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-[#6E7681]">Priority</span>
            <div className="flex items-center gap-1.5">
              <PriorityGlyph priority={issue.priority} size={12} />
              <select
                value={issue.priority}
                onChange={(e) =>
                  onUpdateIssue({
                    ...issue,
                    priority: e.target.value as IssuePriority,
                    updatedAt: 'Just now',
                  })
                }
                className="h-[26px] px-2 bg-[#0E1012] border border-white/[0.08] focus:border-[#5E6AD2] rounded-[4px] type-label-sm text-[#e3e2e3] outline-none cursor-pointer"
              >
                {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Assignee Row */}
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-[#6E7681]">Assignee</span>
            <select
              value={issue.assigneeId || ''}
              onChange={(e) =>
                onUpdateIssue({
                  ...issue,
                  assigneeId: e.target.value || null,
                  updatedAt: 'Just now',
                })
              }
              className="h-[26px] px-2 bg-[#0E1012] border border-white/[0.08] focus:border-[#5E6AD2] rounded-[4px] type-label-sm text-[#e3e2e3] outline-none cursor-pointer"
            >
              <option value="">Unassigned</option>
              {TEAM_MEMBERS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Project Stream Row */}
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-[#6E7681]">Initiative</span>
            <select
              value={issue.projectId}
              onChange={(e) =>
                onUpdateIssue({
                  ...issue,
                  projectId: e.target.value,
                  updatedAt: 'Just now',
                })
              }
              className="h-[26px] px-2 bg-[#0E1012] border border-white/[0.08] focus:border-[#5E6AD2] rounded-[4px] type-label-sm text-[#e3e2e3] outline-none cursor-pointer max-w-[190px] truncate"
            >
              {PROJECTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Cycle & Story Point Estimate */}
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-[#6E7681]">Cycle / Estimate</span>
            <div className="flex items-center gap-1.5">
              <select
                value={issue.cycleId}
                onChange={(e) =>
                  onUpdateIssue({ ...issue, cycleId: e.target.value })
                }
                className="h-[26px] px-2 bg-[#0E1012] border border-white/[0.08] rounded-[4px] type-label-sm text-[#c6c5d5] outline-none cursor-pointer"
              >
                {CYCLES.map((c) => (
                  <option key={c.id} value={c.id}>
                    Cycle {c.number}
                  </option>
                ))}
              </select>

              <select
                value={issue.estimate}
                onChange={(e) =>
                  onUpdateIssue({
                    ...issue,
                    estimate: Number(e.target.value),
                    updatedAt: 'Just now',
                  })
                }
                className="h-[26px] px-2 bg-[#0E1012] border border-white/[0.08] rounded-[4px] font-mono-tabular type-label-sm text-[#e3e2e3] outline-none cursor-pointer"
              >
                {[1, 2, 3, 5, 8, 13].map((pts) => (
                  <option key={pts} value={pts}>
                    {pts} pts
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Git Branch & PR Telemetry Box */}
        <div className="bg-[#121417] border border-white/[0.06] rounded-[4px] p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="type-label-sm text-[#908f9e] flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-[#5E6AD2]" />
              <span>Git Workflow</span>
            </span>
            {issue.prNumber && (
              <span className="inline-flex items-center gap-1 font-mono-tabular text-[11px] text-[#27C383]">
                <GitPullRequest className="w-3 h-3" />
                <span>PR {issue.prNumber} Linked</span>
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 bg-[#0E1012] border border-white/[0.08] rounded-[4px] px-2.5 py-1.5">
            <code className="font-mono-tabular text-[11px] text-[#c6c5d5] truncate">
              {branchSlug}
            </code>
            <button
              onClick={handleCopyBranch}
              className="h-[22px] px-2 rounded-[3px] bg-white/[0.05] hover:bg-white/[0.1] text-[#e3e2e3] type-label-sm flex items-center gap-1 shrink-0 cursor-pointer"
            >
              {copiedBranch ? (
                <>
                  <Check className="w-3 h-3 text-[#27C383]" />
                  <span className="text-[#27C383]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Engineering Sub-Tasks Checklist */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="type-label-md text-[#e3e2e3]">
              Implementation Sub-tasks
            </span>
            <span className="font-mono-tabular text-[11px] text-[#6E7681]">
              {issue.subtasks.filter((s) => s.completed).length}/
              {issue.subtasks.length} completed
            </span>
          </div>

          <div className="space-y-1">
            {issue.subtasks.map((st) => (
              <div
                key={st.id}
                onClick={() => handleToggleSubtask(st.id)}
                className="flex items-center gap-2.5 p-2 rounded-[4px] bg-[#121417] border border-white/[0.06] hover:border-white/[0.12] cursor-pointer"
              >
                <PrecisionCheckbox
                  checked={st.completed}
                  onChange={() => handleToggleSubtask(st.id)}
                />
                <span
                  className={`type-body-sm ${
                    st.completed
                      ? 'line-through text-[#6E7681]'
                      : 'text-[#e3e2e3]'
                  }`}
                >
                  {st.title}
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddSubtask} className="flex items-center gap-1.5">
            <input
              type="text"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              placeholder="Add verification step or subtask..."
              className="flex-1 h-[28px] px-2.5 bg-[#0E1012] border border-white/[0.08] focus:border-[#5E6AD2] rounded-[4px] type-body-sm text-[#E6E8EB] placeholder-[#4E535B] outline-none"
            />
            <button
              type="submit"
              className="h-[28px] px-2.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-[4px] type-label-sm text-[#e3e2e3] flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Add</span>
            </button>
          </form>
        </div>

        {/* Activity Stream & Comments */}
        <div className="space-y-3 pt-2 border-t border-white/[0.08]">
          <div className="flex items-center justify-between">
            <span className="type-label-md text-[#e3e2e3]">Activity Log</span>
            <Kbd>M</Kbd>
          </div>

          <div className="space-y-2.5">
            {issue.activity.length === 0 ? (
              <p className="text-[12px] text-[#6E7681]">
                No commits or review comments recorded yet.
              </p>
            ) : (
              issue.activity.map((act) => {
                const author =
                  TEAM_MEMBERS.find((m) => m.id === act.authorId) ||
                  TEAM_MEMBERS[0];
                return (
                  <div
                    key={act.id}
                    className="p-2.5 rounded-[4px] bg-[#121417] border border-white/[0.06] space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px] text-[#6E7681]">
                      <div className="flex items-center gap-1.5">
                        <MemberAvatar
                          initials={author.initials}
                          color={author.color}
                          name={author.name}
                          size="xs"
                        />
                        <span className="text-[#c6c5d5] font-medium">
                          {author.name}
                        </span>
                        {act.meta && (
                          <span className="font-mono-tabular text-[#8B95E5]">
                            [{act.meta}]
                          </span>
                        )}
                      </div>
                      <span className="font-mono-tabular">{act.timestamp}</span>
                    </div>
                    <p className="type-body-sm text-[#e3e2e3] pl-6">
                      {act.content}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          <form onSubmit={handleAddComment} className="flex items-center gap-1.5">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Leave an engineering note..."
              className="flex-1 h-[28px] px-2.5 bg-[#0E1012] border border-white/[0.08] focus:border-[#5E6AD2] rounded-[4px] type-body-sm text-[#E6E8EB] placeholder-[#4E535B] outline-none"
            />
            <button
              type="submit"
              className="h-[28px] px-2.5 bg-[#5E6AD2] hover:bg-[#4D58BF] text-white rounded-[4px] type-label-sm flex items-center gap-1 cursor-pointer"
            >
              <Send className="w-3 h-3" />
              <span>Post</span>
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
};
