import React from 'react';
import {
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  X,
} from 'lucide-react';
import { ActiveScreen, IssuePriority, IssueStatus } from '../types';
import { Kbd } from './Primitives';
import { PRIORITY_CONFIG, TEAM_MEMBERS } from '../data';

interface TopHeaderProps {
  activeScreen: ActiveScreen;
  onSelectScreen: (screen: ActiveScreen) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  priorityFilter: IssuePriority | 'all';
  onPriorityFilterChange: (p: IssuePriority | 'all') => void;
  assigneeFilter: string | 'all';
  onAssigneeFilterChange: (a: string | 'all') => void;
  statusFilter: IssueStatus | 'all';
  onStatusFilterChange: (s: IssueStatus | 'all') => void;
  sortBy: 'priority' | 'estimate' | 'updated';
  onSortByChange: (s: 'priority' | 'estimate' | 'updated') => void;
  onOpenNewIssue: () => void;
  onOpenCommandPalette: () => void;
  activeProjectName: string | null;
  onClearProject: () => void;
  totalMatching: number;
  selectedCount: number;
  onClearSelection: () => void;
  onBulkStatusChange: (status: IssueStatus) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeScreen,
  onSelectScreen,
  searchQuery,
  onSearchChange,
  priorityFilter,
  onPriorityFilterChange,
  assigneeFilter,
  onAssigneeFilterChange,
  sortBy,
  onSortByChange,
  onOpenNewIssue,
  onOpenCommandPalette,
  activeProjectName,
  onClearProject,
  totalMatching,
  selectedCount,
  onClearSelection,
  onBulkStatusChange,
}) => {
  const topNavLinks: { id: ActiveScreen; label: string }[] = [
    { id: 'board', label: 'Board' },
    { id: 'list', label: 'Issue Grid' },
    { id: 'cycles', label: 'Cycles' },
    { id: 'triage', label: 'Triage' },
    { id: 'roadmap', label: 'Initiatives' },
  ];

  return (
    <div className="bg-[#0C0D0E] border-b border-white/[0.08] shrink-0 select-none z-10">
      {/* Row 1: Strict 3-Zone Top Bar Contract */}
      <header className="h-[44px] px-4 flex items-center justify-between border-b border-white/[0.04]">
        {/* Zone 1: Single text element Brand Title */}
        <a
          href="#workspace"
          onClick={(e) => {
            e.preventDefault();
            onClearProject();
            onSelectScreen('board');
          }}
          className="font-display font-semibold text-[14px] text-[#e3e2e3] tracking-tight whitespace-nowrap"
        >
          Core Infrastructure
        </a>

        {/* Zone 2: 5 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6">
          {topNavLinks.map((item) => {
            const active = activeScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectScreen(item.id)}
                className={`text-[12px] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1 border-b-2 ${
                  active
                    ? 'text-white border-[#5E6AD2]'
                    : 'text-[#908f9e] hover:text-[#e3e2e3] border-transparent'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 2 primary actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCommandPalette}
            className="h-[28px] px-2.5 bg-white/[0.03] hover:bg-white/[0.06] text-[#D0D6E0] hover:text-white border border-white/[0.08] rounded-[4px] type-label-md flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
          >
            <span>Command</span>
            <Kbd>⌘K</Kbd>
          </button>
          <button
            onClick={onOpenNewIssue}
            className="h-[28px] px-2.5 bg-[#5E6AD2] hover:bg-[#4D58BF] active:scale-[0.99] text-white border border-white/10 rounded-[4px] type-label-md flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Issue</span>
          </button>
        </div>
      </header>

      {/* Row 2: Contextual Filter & Utility Bar */}
      <div className="h-[38px] px-4 flex items-center justify-between gap-3 bg-[#08090A]/60">
        {selectedCount > 0 ? (
          /* Multi-select Bulk Action Bar */
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <span className="type-label-md text-[#bdc2ff] font-mono-tabular">
                {selectedCount} selected
              </span>
              <span className="text-white/20">·</span>
              <div className="flex items-center gap-1.5">
                <span className="type-body-sm text-[#908f9e]">Move to:</span>
                {(['todo', 'in_progress', 'in_review', 'done', 'blocked'] as IssueStatus[]).map(
                  (st) => (
                    <button
                      key={st}
                      onClick={() => onBulkStatusChange(st)}
                      className="h-[24px] px-2 bg-white/[0.04] hover:bg-[#5E6AD2] text-[#e3e2e3] hover:text-white border border-white/[0.08] rounded-[4px] type-label-sm capitalize transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {st.replace('_', ' ')}
                    </button>
                  )
                )}
              </div>
            </div>
            <button
              onClick={onClearSelection}
              className="h-[24px] px-2 text-[#908f9e] hover:text-white type-label-sm flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3 h-3" />
              <span>Clear selection (Esc)</span>
            </button>
          </div>
        ) : (
          <>
            {/* Left Filter Controls */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {/* Inline Search Input */}
              <div className="relative flex items-center w-[210px] sm:w-[250px]">
                <Search className="w-3.5 h-3.5 text-[#6E7681] absolute left-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Filter by ID, title, or label..."
                  className="w-full h-[28px] pl-7 pr-6 bg-[#0E1012] border border-white/[0.08] focus:border-[#5E6AD2] focus:shadow-[0_0_0_1px_#5E6AD2] rounded-[4px] type-body-sm text-[#E6E8EB] placeholder-[#4E535B] outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange('')}
                    className="absolute right-2 text-[#6E7681] hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {activeProjectName && (
                <button
                  onClick={onClearProject}
                  className="h-[28px] px-2 bg-[#2E3466]/60 border border-[#5E6AD2]/40 rounded-[4px] type-label-sm text-[#dfe0ff] flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Stream: {activeProjectName}</span>
                  <X className="w-3 h-3" />
                </button>
              )}

              {/* Priority Filter Segmented Selector */}
              <div className="hidden lg:flex items-center gap-1 bg-[#0E1012] border border-white/[0.08] rounded-[4px] p-0.5 h-[28px]">
                <Filter className="w-3 h-3 text-[#6E7681] ml-1.5 mr-0.5" />
                {(['all', 'urgent', 'high', 'medium', 'low'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => onPriorityFilterChange(p)}
                    className={`h-[22px] px-2 rounded-[3px] type-label-sm whitespace-nowrap transition-colors cursor-pointer ${
                      priorityFilter === p
                        ? 'bg-[#2E3466] text-[#dfe0ff]'
                        : 'text-[#908f9e] hover:text-white'
                    }`}
                  >
                    {p === 'all' ? 'All Priorities' : PRIORITY_CONFIG[p].label}
                  </button>
                ))}
              </div>

              {/* Assignee Filter */}
              <select
                aria-label="Filter by Assignee"
                value={assigneeFilter}
                onChange={(e) => onAssigneeFilterChange(e.target.value)}
                className="hidden sm:block h-[28px] px-2 bg-[#0E1012] border border-white/[0.08] focus:border-[#5E6AD2] rounded-[4px] type-label-sm text-[#D0D6E0] outline-none cursor-pointer"
              >
                <option value="all">All Assignees</option>
                {TEAM_MEMBERS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Right Sort & Summary Count */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="flex items-center gap-1.5 text-[12px] text-[#908f9e] font-mono-tabular">
                <span>{totalMatching} issues</span>
              </div>

              <div className="h-3.5 w-[1px] bg-white/[0.08]" />

              <div className="flex items-center gap-1">
                <ArrowUpDown className="w-3 h-3 text-[#6E7681]" />
                <select
                  aria-label="Sort issues by"
                  value={sortBy}
                  onChange={(e) =>
                    onSortByChange(e.target.value as 'priority' | 'estimate' | 'updated')
                  }
                  className="h-[28px] px-1.5 bg-[#0E1012] border border-white/[0.08] focus:border-[#5E6AD2] rounded-[4px] type-label-sm text-[#D0D6E0] outline-none cursor-pointer"
                >
                  <option value="priority">Sort: Priority</option>
                  <option value="estimate">Sort: Estimate (Pts)</option>
                  <option value="updated">Sort: Recently Updated</option>
                </select>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
