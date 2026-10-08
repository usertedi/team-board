import React, { useState } from 'react';
import {
  Pin,
  Plus,
  LayoutGrid,
  List as ListIcon,
  Search,
  Archive,
  RotateCcw,
  Activity,
  FolderKanban,
  ArrowUpRight,
} from 'lucide-react';
import { useTeamBoards } from '../contexts/TeamBoardsContext';
import { BoardRecord } from '../types/teamBoards';
import { UserAvatar } from './BrandAndPrimitives';

interface BoardsOverviewScreenProps {
  onOpenBoard: (boardId: string) => void;
  onOpenNewBoardModal: () => void;
}

export const BoardsOverviewScreen: React.FC<BoardsOverviewScreenProps> = ({
  onOpenBoard,
  onOpenNewBoardModal,
}) => {
  const {
    boards,
    lists,
    issues,
    members,
    pins,
    activity,
    canEdit,
    togglePinBoard,
    toggleArchiveBoard,
    openIssueByIdentifier,
  } = useTeamBoards();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterText, setFilterText] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const pinnedBoardIds = new Set(pins.map((p) => p.boardId));

  const visibleBoards = boards.filter((b) => {
    if (b.archived !== showArchived) return false;
    if (filterText.trim() !== '') {
      const q = filterText.toLowerCase();
      return (
        b.title.toLowerCase().includes(q) ||
        b.teamKey.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pinnedBoards = visibleBoards.filter((b) => pinnedBoardIds.has(b.id));

  // Compute progress strictly from real issues in the board's Done list vs total
  const computeBoardMetrics = (board: BoardRecord) => {
    const boardLists = lists.filter((l) => l.boardId === board.id);
    const doneListIds = new Set(
      boardLists.filter((l) => l.isDoneList).map((l) => l.id)
    );
    const boardIssues = issues.filter((i) => i.boardId === board.id);
    const totalCount = boardIssues.length;
    const doneCount = boardIssues.filter((i) =>
      doneListIds.has(i.listId)
    ).length;
    const openCount = totalCount - doneCount;
    const progressPct =
      totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

    const assigneeIds = Array.from(
      new Set(boardIssues.map((i) => i.assigneeId).filter(Boolean))
    );
    const boardMembers = members.filter((m) =>
      assigneeIds.includes(m.userId)
    );

    return {
      totalCount,
      doneCount,
      openCount,
      progressPct,
      boardMembers: boardMembers.length > 0 ? boardMembers : members.slice(0, 3),
    };
  };

  const renderBoardCard = (board: BoardRecord) => {
    const isPinned = pinnedBoardIds.has(board.id);
    const {
      totalCount,
      doneCount,
      openCount,
      progressPct,
      boardMembers,
    } = computeBoardMetrics(board);

    if (viewMode === 'list') {
      return (
        <div
          key={board.id}
          onClick={() => onOpenBoard(board.id)}
          className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] rounded-[var(--radius-md)] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors cursor-pointer"
        >
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--accent-tint)] text-[var(--accent-primary)] font-mono-id text-[12px] font-semibold">
                {board.teamKey}
              </span>
              <h3 className="text-[15px] font-semibold text-[var(--text-primary)] truncate">
                {board.title}
              </h3>
              <span className="text-[12px] text-[var(--text-muted)] capitalize">
                · {board.template.replace('_', ' ')}
              </span>
            </div>
            <p className="text-[14px] text-[var(--text-secondary)] truncate">
              {board.description}
            </p>
          </div>

          <div className="flex items-center gap-5 shrink-0">
            <div className="w-36 space-y-1">
              <div className="flex justify-between font-mono-id text-[12px] text-[var(--text-muted)]">
                <span>
                  {doneCount}/{totalCount} done
                </span>
                <span>{progressPct}%</span>
              </div>
              <div className="w-full h-1.5 bg-[var(--bg-surface-2)] rounded-full overflow-hidden">
                <div
                  style={{ width: `${progressPct}%` }}
                  className="h-full bg-[var(--status-done)]"
                />
              </div>
            </div>

            <span className="font-mono-id text-[12px] text-[var(--text-secondary)] w-20 text-right">
              {openCount} open
            </span>

            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1"
            >
              <button
                type="button"
                onClick={() => togglePinBoard(board.id)}
                aria-label={isPinned ? 'Unpin board' : 'Pin board'}
                className={`w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center border transition-colors cursor-pointer ${
                  isPinned
                    ? 'bg-[var(--accent-tint)] border-[var(--accent-primary)] text-[var(--accent-primary)]'
                    : 'bg-[var(--bg-surface-2)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Pin className="w-3.5 h-3.5" />
              </button>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => toggleArchiveBoard(board.id)}
                  aria-label={
                    board.archived ? 'Restore board' : 'Archive board'
                  }
                  title={board.archived ? 'Restore board' : 'Archive board'}
                  className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center justify-center cursor-pointer"
                >
                  {board.archived ? (
                    <RotateCcw className="w-3.5 h-3.5" />
                  ) : (
                    <Archive className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        key={board.id}
        onClick={() => onOpenBoard(board.id)}
        className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] rounded-[var(--radius-md)] p-5 flex flex-col justify-between gap-4 transition-colors cursor-pointer"
      >
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--accent-tint)] text-[var(--accent-primary)] font-mono-id text-[12px] font-semibold">
                {board.teamKey}
              </span>
              <span className="text-[12px] text-[var(--text-muted)] capitalize">
                {board.template.replace('_', ' ')}
              </span>
            </div>

            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1"
            >
              <button
                type="button"
                onClick={() => togglePinBoard(board.id)}
                aria-label={isPinned ? 'Unpin board' : 'Pin board'}
                title={isPinned ? 'Unpin board' : 'Pin board'}
                className={`w-7 h-7 rounded-[var(--radius-sm)] flex items-center justify-center border transition-colors cursor-pointer ${
                  isPinned
                    ? 'bg-[var(--accent-tint)] border-[var(--accent-primary)] text-[var(--accent-primary)]'
                    : 'bg-[var(--bg-surface-2)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Pin className="w-3.5 h-3.5" />
              </button>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => toggleArchiveBoard(board.id)}
                  aria-label={
                    board.archived ? 'Restore board' : 'Archive board'
                  }
                  title={board.archived ? 'Restore board' : 'Archive board'}
                  className="w-7 h-7 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center justify-center cursor-pointer"
                >
                  {board.archived ? (
                    <RotateCcw className="w-3.5 h-3.5" />
                  ) : (
                    <Archive className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>
          </div>

          <h3 className="text-[16px] leading-[22px] font-semibold text-[var(--text-primary)]">
            {board.title}
          </h3>
          <p className="text-[14px] leading-[20px] text-[var(--text-secondary)] line-clamp-2">
            {board.description}
          </p>
        </div>

        {/* Real Computed Progress Bar & Footer */}
        <div className="space-y-3 pt-2">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between font-mono-id text-[12px] text-[var(--text-muted)]">
              <span>
                {doneCount} of {totalCount} done ({progressPct}%)
              </span>
              <span>{openCount} open issues</span>
            </div>
            <div className="w-full h-1.5 bg-[var(--bg-surface-2)] rounded-full overflow-hidden">
              <div
                style={{ width: `${progressPct}%` }}
                className="h-full bg-[var(--status-done)] transition-all"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-[12px] text-[var(--text-muted)]">
            <div className="flex items-center -space-x-1.5">
              {boardMembers.slice(0, 4).map((m) => (
                <UserAvatar
                  key={m.userId}
                  displayName={m.displayName}
                  initials={m.initials}
                  color={m.color}
                  size="sm"
                />
              ))}
            </div>
            <span>Last activity {board.updatedAt}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-8">
      {/* Top Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <h1 className="text-[20px] leading-[28px] font-semibold text-[var(--text-primary)]">
            Boards Overview
          </h1>
          <p className="text-[14px] text-[var(--text-secondary)]">
            Progress bars and open issue counts are computed live from each board’s Done column.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Filter Box */}
          <div className="relative flex items-center w-[220px]">
            <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Filter boards..."
              aria-label="Filter boards"
              className="w-full h-9 pl-8 pr-3 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-[var(--radius-sm)] text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none"
            />
          </div>

          {/* Active vs Archived Toggle */}
          <button
            type="button"
            onClick={() => setShowArchived((s) => !s)}
            className={`h-9 px-3 rounded-[var(--radius-sm)] border text-[13px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              showArchived
                ? 'bg-[var(--bg-selected)] border-[var(--accent-primary)] text-[var(--text-primary)]'
                : 'bg-[var(--bg-surface-1)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>{showArchived ? 'Showing Archived' : 'Archived Boards'}</span>
          </button>

          {/* Grid / List View Toggle */}
          <div className="flex items-center bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] p-0.5 h-9">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              className={`h-7 px-2.5 rounded-[3px] flex items-center gap-1 text-[12px] font-medium cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[var(--bg-selected)] text-[var(--text-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              aria-label="List view"
              className={`h-7 px-2.5 rounded-[3px] flex items-center gap-1 text-[12px] font-medium cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[var(--bg-selected)] text-[var(--text-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>

          {canEdit && (
            <button
              type="button"
              onClick={onOpenNewBoardModal}
              className="h-9 px-3.5 rounded-[var(--radius-sm)] bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white text-[13px] font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Board</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Layout: Boards + Recent Workspace Events Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          {/* Pinned Boards Section */}
          {!showArchived && pinnedBoards.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-[var(--text-secondary)]">
                <Pin className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                <span>Pinned Boards ({pinnedBoards.length})</span>
              </div>
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
                    : 'space-y-3'
                }
              >
                {pinnedBoards.map((b) => renderBoardCard(b))}
              </div>
            </section>
          )}

          {/* All Boards Section */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-[var(--text-secondary)]">
                <FolderKanban className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span>
                  {showArchived ? 'Archived Boards' : 'All Workspace Boards'} (
                  {visibleBoards.length})
                </span>
              </div>
            </div>

            {visibleBoards.length === 0 ? (
              <div className="p-8 rounded-[var(--radius-md)] border border-dashed border-[var(--border-strong)] text-center space-y-3">
                <div className="text-[15px] font-semibold text-[var(--text-primary)]">
                  {showArchived
                    ? 'No archived boards'
                    : filterText.trim()
                    ? 'No boards match your filter'
                    : 'Your workspace has no boards yet'}
                </div>
                <p className="text-[13px] text-[var(--text-muted)] max-w-md mx-auto">
                  {showArchived
                    ? 'Archived boards can be restored at any time without losing issues.'
                    : 'Start fresh by creating your first board from a Kanban, Milestone/Campaign, or Requests template—or accept an invite token under Members & Invites.'}
                </p>
                {canEdit && !showArchived && (
                  <button
                    type="button"
                    onClick={onOpenNewBoardModal}
                    className="h-9 px-4 rounded-[var(--radius-sm)] bg-[var(--accent-primary)] text-white text-[13px] font-medium inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Your First Board</span>
                  </button>
                )}
              </div>
            ) : (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
                    : 'space-y-3'
                }
              >
                {visibleBoards.map((b) => renderBoardCard(b))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Recent Workspace Events Feed from Real Activity Log */}
        <aside className="lg:col-span-4 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] p-4 space-y-4">
          <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border-subtle)]">
            <span className="text-[14px] font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[var(--accent-primary)]" />
              <span>Recent Workspace Events</span>
            </span>
            <span className="font-mono-id text-[12px] text-[var(--text-muted)]">
              {activity.length} events
            </span>
          </div>

          <div className="divide-y divide-[var(--border-subtle)] max-h-[520px] overflow-y-auto">
            {activity.slice(0, 12).map((act) => (
              <div
                key={act.id}
                onClick={() => {
                  if (act.issueIdentifier) {
                    openIssueByIdentifier(act.issueIdentifier);
                  } else if (act.boardId) {
                    onOpenBoard(act.boardId);
                  }
                }}
                className="py-3 flex items-start justify-between gap-3 hover:bg-[var(--bg-surface-2)]/60 px-2 -mx-2 rounded-[var(--radius-sm)] transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <UserAvatar
                    displayName={act.actorName}
                    initials={act.actorInitials}
                    color={act.actorColor}
                    size="sm"
                  />
                  <div className="text-[13px] leading-[18px] min-w-0">
                    <span className="font-medium text-[var(--text-primary)]">
                      {act.actorName}
                    </span>{' '}
                    <span className="text-[var(--text-secondary)]">
                      {act.action}
                    </span>
                    <div className="text-[12px] text-[var(--text-muted)] truncate mt-0.5">
                      {act.detail}
                    </div>
                  </div>
                </div>
                <span className="font-mono-id text-[12px] text-[var(--text-muted)] shrink-0">
                  {act.createdAt}
                </span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
};
