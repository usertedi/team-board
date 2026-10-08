import React, { useState } from 'react';
import { Plus, GitPullRequest, CheckSquare } from 'lucide-react';
import { Issue, IssueStatus } from '../types';
import { STATUS_CONFIG, TEAM_MEMBERS, PROJECTS } from '../data';
import {
  StatusGlyph,
  PriorityGlyph,
  PrecisionCheckbox,
  MemberAvatar,
} from './Primitives';

interface BoardViewProps {
  issues: Issue[];
  focusedIssueId: string | null;
  selectedIssueIds: Set<string>;
  onSelectIssue: (issue: Issue) => void;
  onToggleCheckbox: (issueId: string, e: React.MouseEvent) => void;
  onMoveIssueStatus: (issueId: string, newStatus: IssueStatus) => void;
  onOpenNewIssueWithStatus: (status: IssueStatus) => void;
}

const BOARD_COLUMNS: IssueStatus[] = [
  'backlog',
  'todo',
  'in_progress',
  'in_review',
  'done',
  'blocked',
];

export const BoardView: React.FC<BoardViewProps> = ({
  issues,
  focusedIssueId,
  selectedIssueIds,
  onSelectIssue,
  onToggleCheckbox,
  onMoveIssueStatus,
  onOpenNewIssueWithStatus,
}) => {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<IssueStatus | null>(null);
  const [mobileColumn, setMobileColumn] = useState<IssueStatus>('in_progress');

  const handleDragStart = (e: React.DragEvent, issueId: string) => {
    setDraggingId(issueId);
    e.dataTransfer.setData('text/plain', issueId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, status: IssueStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatus: IssueStatus) => {
    e.preventDefault();
    const issueId = e.dataTransfer.getData('text/plain') || draggingId;
    if (issueId) {
      onMoveIssueStatus(issueId, targetStatus);
    }
    setDraggingId(null);
    setDragOverColumn(null);
  };

  const renderIssueCard = (issue: Issue) => {
    const isFocused = focusedIssueId === issue.id;
    const isSelected = selectedIssueIds.has(issue.id);
    const isDragging = draggingId === issue.id;
    const assignee = TEAM_MEMBERS.find((m) => m.id === issue.assigneeId);
    const project = PROJECTS.find((p) => p.id === issue.projectId);
    const completedSubtasks = issue.subtasks.filter((s) => s.completed).length;

    return (
      <div
        key={issue.id}
        draggable
        onDragStart={(e) => handleDragStart(e, issue.id)}
        onDragEnd={handleDragEnd}
        onClick={() => onSelectIssue(issue)}
        className={`group rounded-[4px] p-3 transition-all duration-100 cursor-pointer select-none ${
          isDragging
            ? 'bg-[#181B1F] border border-[#5E6AD2] opacity-92 rotate-[0.5deg] shadow-lg'
            : isSelected || isFocused
            ? 'bg-[#141726] border border-[#5E6AD2] shadow-[0_0_0_1px_#5E6AD2]'
            : 'bg-[#121417] border border-white/[0.06] hover:border-white/[0.14]'
        }`}
      >
        {/* Top Row: Issue ID + Checkbox + Assignee */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <PrecisionCheckbox
              checked={isSelected}
              onChange={(e) => onToggleCheckbox(issue.id, e)}
              ariaLabel={`Select ${issue.id}`}
            />
            <span className="font-mono-tabular text-[11px] font-medium text-[#908f9e] group-hover:text-[#c6c5d5] transition-colors">
              {issue.id}
            </span>
            {project && (
              <>
                <span className="text-white/20 text-[11px]">·</span>
                <span className="text-[11px] text-[#6E7681] truncate">{project.key}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {assignee ? (
              <MemberAvatar
                initials={assignee.initials}
                color={assignee.color}
                name={assignee.name}
                size="xs"
              />
            ) : (
              <span className="w-[18px] h-[18px] rounded-full border border-dashed border-white/20 inline-flex items-center justify-center text-[9px] text-[#6E7681]">
                ?
              </span>
            )}
          </div>
        </div>

        {/* Issue Title */}
        <h4 className="type-body-md font-medium text-[#e3e2e3] group-hover:text-white line-clamp-2 mb-2.5 leading-[18px]">
          {issue.title}
        </h4>

        {/* Bottom Metadata Row: Unboxed clean metadata with middot separators per Zero-Pill rule */}
        <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-white/[0.04] text-[11px] text-[#908f9e]">
          <div className="flex items-center gap-1.5 min-w-0 truncate">
            <PriorityGlyph priority={issue.priority} size={12} />
            <span className="font-mono-tabular">{issue.estimate}pt</span>
            {issue.labels.length > 0 && (
              <>
                <span aria-hidden="true" className="text-white/20">
                  ·
                </span>
                <span className="truncate text-[#8A8F98]">{issue.labels.join(' / ')}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0 font-mono-tabular text-[11px] text-[#6E7681]">
            {issue.subtasks.length > 0 && (
              <span className="inline-flex items-center gap-1">
                <CheckSquare className="w-3 h-3 text-[#6E7681]" />
                <span>
                  {completedSubtasks}/{issue.subtasks.length}
                </span>
              </span>
            )}
            {issue.prNumber && (
              <span className="inline-flex items-center gap-0.5 text-[#8B95E5]">
                <GitPullRequest className="w-3 h-3" />
                <span>{issue.prNumber}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#08090A]">
      {/* Mobile (<768px) Segmented Column Switcher per Layout Spec */}
      <div className="md:hidden px-4 py-2 bg-[#0C0D0E] border-b border-white/[0.08] flex items-center gap-1 overflow-x-auto">
        {BOARD_COLUMNS.map((status) => {
          const cfg = STATUS_CONFIG[status];
          const count = issues.filter((i) => i.status === status).length;
          const active = mobileColumn === status;
          return (
            <button
              key={status}
              onClick={() => setMobileColumn(status)}
              className={`h-[26px] px-2.5 rounded-[4px] type-label-sm flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                active
                  ? 'bg-[#2E3466] text-[#dfe0ff] border border-[#5E6AD2]/50'
                  : 'text-[#908f9e] bg-white/[0.02]'
              }`}
            >
              <StatusGlyph status={status} size={11} />
              <span>{cfg.label}</span>
              <span className="font-mono-tabular text-[10px] opacity-75">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile Single-Column Feed */}
      <div className="md:hidden flex-1 overflow-y-auto p-4 space-y-2.5">
        {issues
          .filter((i) => i.status === mobileColumn)
          .map((issue) => renderIssueCard(issue))}
      </div>

      {/* Desktop & Tablet Multi-Column Fluid Board: 320px pinned columns separated by 1rem (16px) gaps */}
      <div className="hidden md:flex flex-1 overflow-x-auto overflow-y-hidden p-4 gap-4 items-stretch">
        {BOARD_COLUMNS.map((status) => {
          const cfg = STATUS_CONFIG[status];
          const columnIssues = issues.filter((i) => i.status === status);
          const totalPoints = columnIssues.reduce((acc, i) => acc + i.estimate, 0);
          const isDragOver = dragOverColumn === status;

          return (
            <section
              key={status}
              onDragOver={(e) => handleDragOver(e, status)}
              onDragLeave={() => setDragOverColumn(null)}
              onDrop={(e) => handleDrop(e, status)}
              className={`w-[320px] shrink-0 flex flex-col rounded-[4px] bg-[#0C0D0E] border transition-colors ${
                isDragOver
                  ? 'border-[#5E6AD2] bg-[#5E6AD2]/[0.03]'
                  : 'border-white/[0.08]'
              }`}
            >
              {/* Swimlane Column Header */}
              <header className="h-[38px] px-3 border-b border-white/[0.08] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <StatusGlyph status={status} size={13} />
                  <h3 className="type-label-md text-[#e3e2e3] font-semibold truncate">
                    {cfg.label}
                  </h3>
                  <span className="font-mono-tabular text-[11px] text-[#6E7681]">
                    {columnIssues.length}
                  </span>
                  <span className="text-white/15">·</span>
                  <span className="font-mono-tabular text-[11px] text-[#6E7681]">
                    {totalPoints}pt
                  </span>
                </div>

                <button
                  onClick={() => onOpenNewIssueWithStatus(status)}
                  title={`Add issue to ${cfg.label}`}
                  className="w-6 h-6 rounded-[4px] text-[#908f9e] hover:text-white hover:bg-white/[0.06] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </header>

              {/* Column Cards Stack */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
                {columnIssues.map((issue) => renderIssueCard(issue))}

                {/* Empty State / Drop Target per Precision Slate Spec */}
                {columnIssues.length === 0 && (
                  <button
                    type="button"
                    onClick={() => onOpenNewIssueWithStatus(status)}
                    className={`w-full h-[96px] rounded-[4px] border border-dashed flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      isDragOver
                        ? 'border-[#5E6AD2] bg-[#5E6AD2]/[0.04] text-[#bdc2ff]'
                        : 'border-white/[0.12] bg-transparent hover:border-[#5E6AD2] hover:bg-[#5E6AD2]/[0.04] text-[#6E7681] hover:text-[#c6c5d5]'
                    }`}
                  >
                    <span className="type-label-sm">No issues in {cfg.label}</span>
                    <span className="text-[11px] text-[#5E6AD2]">+ Create or drop issue</span>
                  </button>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
