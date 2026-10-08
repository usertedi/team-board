import React, { useState } from 'react';
import { ChevronDown, ChevronRight, GitPullRequest, Plus } from 'lucide-react';
import { Issue, IssueStatus, IssuePriority } from '../types';
import { STATUS_CONFIG, PRIORITY_CONFIG, TEAM_MEMBERS, PROJECTS } from '../data';
import {
  StatusGlyph,
  PriorityGlyph,
  PrecisionCheckbox,
  MemberAvatar,
} from './Primitives';

interface ListViewProps {
  issues: Issue[];
  focusedIssueId: string | null;
  selectedIssueIds: Set<string>;
  onSelectIssue: (issue: Issue) => void;
  onToggleCheckbox: (issueId: string, e: React.MouseEvent) => void;
  onUpdateStatus: (issueId: string, status: IssueStatus) => void;
  onUpdatePriority: (issueId: string, priority: IssuePriority) => void;
  onOpenNewIssueWithStatus: (status: IssueStatus) => void;
}

const STATUS_GROUPS: IssueStatus[] = [
  'in_progress',
  'in_review',
  'blocked',
  'todo',
  'backlog',
  'done',
];

export const ListView: React.FC<ListViewProps> = ({
  issues,
  focusedIssueId,
  selectedIssueIds,
  onSelectIssue,
  onToggleCheckbox,
  onUpdateStatus,
  onUpdatePriority,
  onOpenNewIssueWithStatus,
}) => {
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (status: IssueStatus) => {
    setCollapsedGroups((prev) => ({ ...prev, [status]: !prev[status] }));
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#08090A]">
      {/* Sticky High-Density Column Headers */}
      <div className="sticky top-0 z-10 h-[32px] px-4 bg-[#0C0D0E] border-b border-white/[0.08] grid grid-cols-[minmax(280px,1fr)_120px_110px_130px_80px_80px] items-center text-[11px] font-medium text-[#6E7681] select-none">
        <div className="pl-6">Issue / Title</div>
        <div>Stream</div>
        <div>Priority</div>
        <div>Assignee</div>
        <div className="text-right">Estimate</div>
        <div className="text-right">Updated</div>
      </div>

      {/* Grouped Issue Sections */}
      <div className="divide-y divide-white/[0.06]">
        {STATUS_GROUPS.map((status) => {
          const cfg = STATUS_CONFIG[status];
          const groupIssues = issues.filter((i) => i.status === status);
          const isCollapsed = !!collapsedGroups[status];
          const totalPts = groupIssues.reduce((sum, i) => sum + i.estimate, 0);

          return (
            <div key={status} className="bg-[#08090A]">
              {/* Group Header Bar */}
              <div className="h-[34px] px-4 bg-[#0C0D0E]/90 border-b border-white/[0.04] flex items-center justify-between select-none">
                <button
                  type="button"
                  onClick={() => toggleGroup(status)}
                  className="flex items-center gap-2 type-label-md text-[#e3e2e3] hover:text-white cursor-pointer"
                >
                  {isCollapsed ? (
                    <ChevronRight className="w-3.5 h-3.5 text-[#6E7681]" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-[#6E7681]" />
                  )}
                  <StatusGlyph status={status} size={13} />
                  <span className="font-semibold">{cfg.label}</span>
                  <span className="font-mono-tabular text-[11px] text-[#6E7681] ml-1">
                    {groupIssues.length}
                  </span>
                </button>

                <div className="flex items-center gap-3">
                  <span className="font-mono-tabular text-[11px] text-[#6E7681]">
                    {totalPts} pts
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenNewIssueWithStatus(status)}
                    title={`Create issue in ${cfg.label}`}
                    className="w-5 h-5 rounded-[3px] text-[#908f9e] hover:text-white hover:bg-white/[0.06] flex items-center justify-center cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Rows */}
              {!isCollapsed && (
                <div className="divide-y divide-white/[0.04]">
                  {groupIssues.length === 0 ? (
                    <div className="h-[38px] px-10 flex items-center justify-between text-[12px] text-[#6E7681]">
                      <span>No issues currently in {cfg.label}.</span>
                      <button
                        onClick={() => onOpenNewIssueWithStatus(status)}
                        className="text-[#5E6AD2] hover:underline type-label-sm cursor-pointer"
                      >
                        + Add issue
                      </button>
                    </div>
                  ) : (
                    groupIssues.map((issue) => {
                      const isFocused = focusedIssueId === issue.id;
                      const isSelected = selectedIssueIds.has(issue.id);
                      const assignee = TEAM_MEMBERS.find((m) => m.id === issue.assigneeId);
                      const project = PROJECTS.find((p) => p.id === issue.projectId);

                      return (
                        <div
                          key={issue.id}
                          onClick={() => onSelectIssue(issue)}
                          className={`h-[38px] px-4 grid grid-cols-[minmax(280px,1fr)_120px_110px_130px_80px_80px] items-center transition-colors cursor-pointer select-none ${
                            isSelected || isFocused
                              ? 'bg-[#141726] outline-1 -outline-offset-1 outline-[#5E6AD2]'
                              : 'bg-[#121417]/60 hover:bg-[#181B1F]'
                          }`}
                        >
                          {/* Cell 1: Checkbox + ID + Status Quick Cycle + Title */}
                          <div className="flex items-center gap-2.5 min-w-0 pr-4">
                            <PrecisionCheckbox
                              checked={isSelected}
                              onChange={(e) => onToggleCheckbox(issue.id, e)}
                              ariaLabel={`Select ${issue.id}`}
                            />
                            <button
                              type="button"
                              title="Cycle Status"
                              onClick={(e) => {
                                e.stopPropagation();
                                const nextOrder =
                                  (STATUS_GROUPS.indexOf(issue.status) + 1) %
                                  STATUS_GROUPS.length;
                                onUpdateStatus(issue.id, STATUS_GROUPS[nextOrder]);
                              }}
                              className="hover:scale-110 transition-transform shrink-0 cursor-pointer"
                            >
                              <StatusGlyph status={issue.status} size={13} />
                            </button>
                            <span className="font-mono-tabular text-[12px] text-[#908f9e] shrink-0 w-[56px]">
                              {issue.id}
                            </span>
                            <span className="type-body-md text-[#e3e2e3] font-medium truncate">
                              {issue.title}
                            </span>
                            {issue.labels.length > 0 && (
                              <span className="hidden xl:inline-block text-[11px] text-[#6E7681] truncate shrink-0">
                                · {issue.labels.join(' / ')}
                              </span>
                            )}
                            {issue.prNumber && (
                              <span className="hidden lg:inline-flex items-center gap-0.5 font-mono-tabular text-[11px] text-[#8B95E5] shrink-0">
                                <GitPullRequest className="w-3 h-3" />
                                {issue.prNumber}
                              </span>
                            )}
                          </div>

                          {/* Cell 2: Project Stream */}
                          <div className="text-[12px] text-[#908f9e] truncate pr-2">
                            {project ? project.key : '—'}
                          </div>

                          {/* Cell 3: Interactive Priority Selector */}
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center"
                          >
                            <div className="flex items-center gap-1.5">
                              <PriorityGlyph priority={issue.priority} size={12} />
                              <select
                                aria-label={`Priority for ${issue.id}`}
                                value={issue.priority}
                                onChange={(e) =>
                                  onUpdatePriority(
                                    issue.id,
                                    e.target.value as IssuePriority
                                  )
                                }
                                className="bg-transparent text-[12px] text-[#c6c5d5] hover:text-white outline-none cursor-pointer"
                              >
                                {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                                  <option key={k} value={k} className="bg-[#181B1F]">
                                    {v.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Cell 4: Assignee */}
                          <div className="flex items-center gap-2 truncate pr-2">
                            {assignee ? (
                              <>
                                <MemberAvatar
                                  initials={assignee.initials}
                                  color={assignee.color}
                                  name={assignee.name}
                                  size="xs"
                                />
                                <span className="text-[12px] text-[#c6c5d5] truncate">
                                  {assignee.name.split(' ')[0]}
                                </span>
                              </>
                            ) : (
                              <span className="text-[12px] text-[#6E7681]">Unassigned</span>
                            )}
                          </div>

                          {/* Cell 5: Estimate Points (Tabular Numerals) */}
                          <div className="text-right font-mono-tabular text-[12px] text-[#c6c5d5]">
                            {issue.estimate} pt
                          </div>

                          {/* Cell 6: Updated Timestamp */}
                          <div className="text-right font-mono-tabular text-[11px] text-[#6E7681]">
                            {issue.updatedAt}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
