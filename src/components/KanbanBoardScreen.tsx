import React, { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus,
  MoreHorizontal,
  Search,
  Filter,
  ArrowUpDown,
  Layers,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit3,
  MessageSquare,
  X,
} from 'lucide-react';
import { useTeamBoards } from '../contexts/TeamBoardsContext';
import {
  IssueRecord,
  IssuePriority,
  PRIORITY_META,
  BoardListRecord,
} from '../types/teamBoards';
import { UserAvatar, Kbd } from './BrandAndPrimitives';

interface KanbanBoardScreenProps {
  filterInputRef: React.RefObject<HTMLInputElement | null>;
  onOpenNewIssueModal: (listId?: string) => void;
}

/**
 * Priority Signal Icon (14x14, accessible with title)
 */
export const PrioritySignal: React.FC<{ priority: IssuePriority }> = ({
  priority,
}) => {
  const meta = PRIORITY_META[priority];
  if (priority === 'urgent') {
    return (
      <span
        title={`Priority: ${meta.label}`}
        className="w-4 h-4 rounded-[3px] bg-[#EB5757] text-white inline-flex items-center justify-center text-[11px] font-bold shrink-0"
      >
        !
      </span>
    );
  }
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className="shrink-0"
      aria-label={`Priority: ${meta.label}`}
    >
      <rect
        x="1.5"
        y="9"
        width="2.2"
        height="3.5"
        rx="0.5"
        fill={meta.bars >= 1 ? meta.color : 'currentColor'}
        fillOpacity={meta.bars >= 1 ? 1 : 0.2}
      />
      <rect
        x="5.5"
        y="6"
        width="2.2"
        height="6.5"
        rx="0.5"
        fill={meta.bars >= 2 ? meta.color : 'currentColor'}
        fillOpacity={meta.bars >= 2 ? 1 : 0.2}
      />
      <rect
        x="9.5"
        y="3"
        width="2.2"
        height="9.5"
        rx="0.5"
        fill={meta.bars >= 3 ? meta.color : 'currentColor'}
        fillOpacity={meta.bars >= 3 ? 1 : 0.2}
      />
    </svg>
  );
};

/**
 * Individual Sortable Issue Card
 */
const SortableIssueCard: React.FC<{
  issue: IssueRecord;
  isSelected: boolean;
  canEdit: boolean;
  onSelect: () => void;
  onKeyboardMoveColumn: (dir: -1 | 1) => void;
}> = ({
  issue,
  isSelected,
  canEdit,
  onSelect,
  onKeyboardMoveColumn,
}) => {
  const { members, labels, comments } = useTeamBoards();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: issue.id,
    disabled: !canEdit,
    data: {
      type: 'Issue',
      issue,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const assignee = members.find((m) => m.userId === issue.assigneeId);
  const issueLabels = labels.filter((l) => issue.labelIds.includes(l.id));
  const commentCount = comments.filter((c) => c.issueId === issue.id).length;

  // Placeholder "Drop here" slot when card is lifted
  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-[108px] rounded-[var(--radius-md)] border-2 border-dashed border-[var(--accent-primary)] bg-[var(--accent-tint)] flex items-center justify-center text-[12px] font-medium text-[var(--accent-primary)] select-none"
      >
        Drop here ({issue.identifier})
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onSelect}
      className={`group rounded-[var(--radius-md)] p-3.5 transition-all select-none cursor-grab active:cursor-grabbing ${
        isSelected
          ? 'bg-[var(--bg-selected)] border border-[var(--accent-primary)] ring-1 ring-[var(--accent-primary)]'
          : 'bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
      }`}
    >
      {/* Top Row: Monospace Issue ID + Keyboard Move Controls + Assignee */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2">
          <PrioritySignal priority={issue.priority} />
          <span className="font-mono-id text-[12px] font-medium text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]">
            {issue.identifier}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Accessible Keyboard / Button Column Move Controls */}
          {canEdit && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 flex items-center gap-0.5 transition-opacity"
            >
              <button
                type="button"
                onClick={() => onKeyboardMoveColumn(-1)}
                aria-label={`Move ${issue.identifier} to previous column`}
                title="Move to previous column"
                className="w-6 h-6 rounded-[var(--radius-sm)] bg-[var(--bg-surface-1)] hover:bg-[var(--bg-surface-3)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onKeyboardMoveColumn(1)}
                aria-label={`Move ${issue.identifier} to next column`}
                title="Move to next column"
                className="w-6 h-6 rounded-[var(--radius-sm)] bg-[var(--bg-surface-1)] hover:bg-[var(--bg-surface-3)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {assignee ? (
            <UserAvatar
              displayName={assignee.displayName}
              initials={assignee.initials}
              color={assignee.color}
              size="sm"
            />
          ) : (
            <span
              title="Unassigned"
              className="w-6 h-6 rounded-full border border-dashed border-[var(--border-strong)] inline-flex items-center justify-center text-[12px] text-[var(--text-muted)]"
            >
              ?
            </span>
          )}
        </div>
      </div>

      {/* Card Title (14px body text minimum) */}
      <h4 className="text-[14px] leading-[20px] font-medium text-[var(--text-primary)] line-clamp-2 mb-2.5">
        {issue.title}
      </h4>

      {/* Colored Labels & Footer Metadata */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--border-subtle)] text-[12px] text-[var(--text-muted)]">
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          {issueLabels.map((lbl) => (
            <span
              key={lbl.id}
              className="inline-flex items-center gap-1 text-[12px] text-[var(--text-secondary)]"
            >
              <span
                style={{ backgroundColor: lbl.color }}
                className="w-2 h-2 rounded-full shrink-0"
              />
              <span className="truncate max-w-[90px]">{lbl.name}</span>
            </span>
          ))}
          {issue.estimate > 0 && (
            <span className="font-mono-id text-[12px] text-[var(--text-muted)]">
              · {issue.estimate}pt
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0 font-mono-id text-[12px]">
          {issue.dueDate && (
            <span className="inline-flex items-center gap-1 text-[var(--text-muted)]">
              <Calendar className="w-3 h-3" />
              <span>{issue.dueDate.slice(5)}</span>
            </span>
          )}
          {commentCount > 0 && (
            <span className="inline-flex items-center gap-1 text-[var(--text-secondary)]">
              <MessageSquare className="w-3 h-3" />
              <span>{commentCount}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Droppable Column Wrapper
 */
const DroppableBoardColumn: React.FC<{
  id: string;
  title: string;
  color: string;
  issues: IssueRecord[];
  inspectedIssueId: string | null;
  canEdit: boolean;
  onSelectIssue: (issueId: string) => void;
  onAddIssue: () => void;
  onRenameList?: (newTitle: string) => void;
  onDeleteList?: () => void;
  onKeyboardMoveColumn: (issue: IssueRecord, dir: -1 | 1) => void;
}> = ({
  id,
  title,
  color,
  issues,
  inspectedIssueId,
  canEdit,
  onSelectIssue,
  onAddIssue,
  onRenameList,
  onDeleteList,
  onKeyboardMoveColumn,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: 'Column',
      listId: id,
    },
  });

  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [titleInput, setTitleInput] = useState(title);

  const totalPoints = issues.reduce((acc, i) => acc + (i.estimate || 0), 0);

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (titleInput.trim() && onRenameList) {
      onRenameList(titleInput.trim());
    }
    setRenaming(false);
  };

  return (
    <section
      ref={setNodeRef}
      aria-label={`${title} column`}
      className={`w-[320px] shrink-0 flex flex-col rounded-[var(--radius-md)] bg-[var(--bg-surface-1)] border transition-colors ${
        isOver
          ? 'border-[var(--accent-primary)] bg-[var(--accent-tint)]/30'
          : 'border-[var(--border-subtle)]'
      }`}
    >
      {/* Column Header with Count, Points, "+" button, and Menu */}
      <header className="h-[44px] px-3.5 border-b border-[var(--border-subtle)] flex items-center justify-between gap-2 shrink-0 relative">
        {renaming ? (
          <form onSubmit={handleRenameSubmit} className="flex-1 flex gap-1">
            <input
              type="text"
              autoFocus
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleRenameSubmit}
              className="flex-1 h-7 px-2 bg-[var(--bg-surface-2)] border border-[var(--accent-primary)] rounded-[var(--radius-sm)] text-[13px] text-[var(--text-primary)] outline-none"
            />
          </form>
        ) : (
          <div className="flex items-center gap-2 min-w-0">
            <span
              style={{ backgroundColor: color }}
              className="w-2.5 h-2.5 rounded-full shrink-0"
            />
            <h3 className="text-[13px] font-semibold text-[var(--text-primary)] truncate">
              {title}
            </h3>
            <span className="font-mono-id text-[12px] text-[var(--text-muted)]">
              {issues.length}
            </span>
            {totalPoints > 0 && (
              <span className="font-mono-id text-[12px] text-[var(--text-muted)]">
                · {totalPoints}pt
              </span>
            )}
          </div>
        )}

        {canEdit && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={onAddIssue}
              aria-label={`Add issue to ${title}`}
              title={`Add issue to ${title}`}
              className="w-7 h-7 rounded-[var(--radius-sm)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)] flex items-center justify-center transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
            {onRenameList && (
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                aria-label={`${title} column options`}
                className="w-7 h-7 rounded-[var(--radius-sm)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)] flex items-center justify-center transition-colors cursor-pointer"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Per-Column Menu Popover */}
        {menuOpen && (
          <div className="absolute right-3 top-10 w-44 bg-[var(--bg-surface-3)] border border-[var(--border-strong)] rounded-[var(--radius-md)] shadow-lg p-1.5 z-30 space-y-1">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onAddIssue();
              }}
              className="w-full h-8 px-2.5 rounded-[var(--radius-sm)] text-left text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)] flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add issue</span>
            </button>
            {onRenameList && (
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setRenaming(true);
                }}
                className="w-full h-8 px-2.5 rounded-[var(--radius-sm)] text-left text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)] flex items-center gap-2 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Rename list</span>
              </button>
            )}
            {onDeleteList && issues.length === 0 && (
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onDeleteList();
                }}
                className="w-full h-8 px-2.5 rounded-[var(--radius-sm)] text-left text-[13px] text-[#EB5757] hover:bg-[#EB5757]/10 flex items-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete empty list</span>
              </button>
            )}
          </div>
        )}
      </header>

      {/* Sortable Issue Cards Stack */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 min-h-[160px]">
        <SortableContext
          items={issues.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          {issues.map((issue) => (
            <SortableIssueCard
              key={issue.id}
              issue={issue}
              isSelected={inspectedIssueId === issue.id}
              canEdit={canEdit}
              onSelect={() => onSelectIssue(issue.id)}
              onKeyboardMoveColumn={(dir) => onKeyboardMoveColumn(issue, dir)}
            />
          ))}
        </SortableContext>

        {/* Empty State or Drop Target */}
        {issues.length === 0 && (
          <div
            onClick={canEdit ? onAddIssue : undefined}
            className={`h-[108px] rounded-[var(--radius-md)] border border-dashed flex flex-col items-center justify-center gap-1 text-center p-3 transition-colors ${
              isOver
                ? 'border-[var(--accent-primary)] bg-[var(--accent-tint)] text-[var(--accent-primary)]'
                : 'border-[var(--border-strong)] text-[var(--text-muted)] hover:border-[var(--accent-primary)]'
            } ${canEdit ? 'cursor-pointer' : ''}`}
          >
            <span className="text-[13px] font-medium">
              {isOver ? 'Drop card here' : `No issues in ${title}`}
            </span>
            {canEdit && (
              <span className="text-[12px] text-[var(--accent-primary)]">
                + Create or drag an issue here
              </span>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export const KanbanBoardScreen: React.FC<KanbanBoardScreenProps> = ({
  filterInputRef,
  onOpenNewIssueModal,
}) => {
  const {
    boards,
    activeBoardId,
    lists,
    issues,
    members,
    labels,
    canEdit,
    inspectedIssueId,
    setInspectedIssueId,
    moveIssueOptimistic,
    updateIssue,
    createList,
    renameList,
    deleteList,
  } = useTeamBoards();

  const [searchQuery, setSearchQuery] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<IssuePriority | 'all'>(
    'all'
  );
  const [labelFilter, setLabelFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'position' | 'priority' | 'estimate'>(
    'position'
  );
  const [groupBy, setGroupBy] = useState<'status' | 'assignee'>('status');
  const [activeDragIssue, setActiveDragIssue] = useState<IssueRecord | null>(
    null
  );
  const [addingList, setAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');

  const activeBoard =
    boards.find((b) => b.id === activeBoardId) || boards[0];

  const boardLists = useMemo(
    () =>
      lists
        .filter((l) => l.boardId === activeBoard?.id)
        .sort((a, b) => a.position - b.position),
    [lists, activeBoard?.id]
  );

  // Filter & Sort Issues on Active Board
  const filteredBoardIssues = useMemo(() => {
    return issues
      .filter((i) => {
        if (i.boardId !== activeBoard?.id) return false;
        if (assigneeFilter !== 'all' && i.assigneeId !== assigneeFilter) {
          return false;
        }
        if (priorityFilter !== 'all' && i.priority !== priorityFilter) {
          return false;
        }
        if (labelFilter !== 'all' && !i.labelIds.includes(labelFilter)) {
          return false;
        }
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          const matchId = i.identifier.toLowerCase().includes(q);
          const matchTitle = i.title.toLowerCase().includes(q);
          const matchDesc = i.description.toLowerCase().includes(q);
          if (!matchId && !matchTitle && !matchDesc) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'priority') {
          return (
            PRIORITY_META[b.priority].order - PRIORITY_META[a.priority].order
          );
        }
        if (sortBy === 'estimate') {
          return b.estimate - a.estimate;
        }
        return a.position - b.position;
      });
  }, [
    issues,
    activeBoard?.id,
    assigneeFilter,
    priorityFilter,
    labelFilter,
    searchQuery,
    sortBy,
  ]);

  // Configure @dnd-kit Pointer & Keyboard Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const issue = issues.find((i) => i.id === event.active.id);
    if (issue) {
      setActiveDragIssue(issue);
    }
  };

  // Fractional Position Calculation on Drag End
  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragIssue(null);
    const { active, over } = event;
    if (!over || !canEdit) return;

    const draggedIssue = issues.find((i) => i.id === active.id);
    if (!draggedIssue) return;

    const overId = String(over.id);

    if (groupBy === 'assignee') {
      // Grouping by Assignee mode: moving across assignee columns updates assigneeId
      const targetAssigneeId =
        overId === 'unassigned'
          ? null
          : members.some((m) => m.userId === overId)
          ? overId
          : issues.find((i) => i.id === overId)?.assigneeId ?? null;

      if (draggedIssue.assigneeId !== targetAssigneeId) {
        const assigneeName =
          members.find((m) => m.userId === targetAssigneeId)?.displayName ||
          'Unassigned';
        updateIssue(
          draggedIssue.id,
          { assigneeId: targetAssigneeId },
          { action: 'changed assignee', detail: `assigned to ${assigneeName}` }
        );
      }
      return;
    }

    // Standard Group by Status (BoardList) with Fractional Indexing
    const isOverColumn = boardLists.some((l) => l.id === overId);
    const overIssue = issues.find((i) => i.id === overId);

    const targetListId = isOverColumn
      ? overId
      : overIssue?.listId || draggedIssue.listId;

    const targetCards = issues
      .filter((i) => i.listId === targetListId && i.id !== draggedIssue.id)
      .sort((a, b) => a.position - b.position);

    let newPosition = 1000;

    if (targetCards.length === 0) {
      newPosition = 1000;
    } else if (isOverColumn) {
      // Dropped onto column container -> place at bottom
      newPosition = targetCards[targetCards.length - 1].position + 1000;
    } else if (overIssue) {
      const overIndex = targetCards.findIndex((i) => i.id === overIssue.id);
      if (overIndex === 0) {
        newPosition = targetCards[0].position / 2;
      } else if (overIndex > 0) {
        const prevCard = targetCards[overIndex - 1];
        const nextCard = targetCards[overIndex];
        newPosition = (prevCard.position + nextCard.position) / 2;
      } else {
        newPosition = targetCards[targetCards.length - 1].position + 1000;
      }
    }

    moveIssueOptimistic(draggedIssue.id, targetListId, newPosition);
  };

  // Accessible Keyboard Column Move Handler
  const handleKeyboardMoveColumn = (issue: IssueRecord, dir: -1 | 1) => {
    if (!canEdit) return;
    const currentIndex = boardLists.findIndex((l) => l.id === issue.listId);
    const nextIndex = currentIndex + dir;
    if (nextIndex < 0 || nextIndex >= boardLists.length) return;
    const targetList = boardLists[nextIndex];
    const targetCards = issues
      .filter((i) => i.listId === targetList.id)
      .sort((a, b) => a.position - b.position);
    const newPos =
      targetCards.length > 0
        ? targetCards[targetCards.length - 1].position + 1000
        : 1000;
    moveIssueOptimistic(issue.id, targetList.id, newPos);
  };

  const handleAddListSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim() || !activeBoard) return;
    createList(activeBoard.id, newListTitle.trim());
    setNewListTitle('');
    setAddingList(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden bg-[var(--bg-canvas)]">
      {/* Filter, Sort & Group By Toolbar */}
      <div className="px-5 py-2.5 bg-[var(--bg-surface-1)] border-b border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Left Filters */}
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[260px]">
          {/* Search Input (Shortcut F) */}
          <div className="relative flex items-center w-[220px]">
            <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-2.5 pointer-events-none" />
            <input
              ref={filterInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter cards (F)..."
              aria-label="Filter cards by title or ID"
              className="w-full h-8 pl-8 pr-7 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-[var(--radius-sm)] text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Assignee Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <select
              aria-label="Filter by Assignee"
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="h-8 px-2.5 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] text-[12px] font-medium text-[var(--text-secondary)] outline-none cursor-pointer"
            >
              <option value="all">All Assignees</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.displayName}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <select
            aria-label="Filter by Priority"
            value={priorityFilter}
            onChange={(e) =>
              setPriorityFilter(e.target.value as IssuePriority | 'all')
            }
            className="h-8 px-2.5 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] text-[12px] font-medium text-[var(--text-secondary)] outline-none cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="none">No Priority</option>
          </select>

          {/* Label Filter */}
          <select
            aria-label="Filter by Label"
            value={labelFilter}
            onChange={(e) => setLabelFilter(e.target.value)}
            className="h-8 px-2.5 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] text-[12px] font-medium text-[var(--text-secondary)] outline-none cursor-pointer"
          >
            <option value="all">All Labels</option>
            {labels.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        {/* Right Group By, Sort & New Issue Button */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Group By Toggle (Status vs Assignee) */}
          <div className="flex items-center gap-1 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] p-0.5 h-8">
            <Layers className="w-3.5 h-3.5 text-[var(--text-muted)] ml-1.5 mr-0.5" />
            <button
              type="button"
              onClick={() => setGroupBy('status')}
              className={`h-6 px-2 rounded-[3px] text-[12px] font-medium transition-colors cursor-pointer ${
                groupBy === 'status'
                  ? 'bg-[var(--bg-selected)] text-[var(--text-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              Group: Status
            </button>
            <button
              type="button"
              onClick={() => setGroupBy('assignee')}
              className={`h-6 px-2 rounded-[3px] text-[12px] font-medium transition-colors cursor-pointer ${
                groupBy === 'assignee'
                  ? 'bg-[var(--bg-selected)] text-[var(--text-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              Assignee
            </button>
          </div>

          {/* Sort By Selector */}
          <div className="flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <select
              aria-label="Sort issues"
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as 'position' | 'priority' | 'estimate'
                )
              }
              className="h-8 px-2 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] text-[12px] font-medium text-[var(--text-secondary)] outline-none cursor-pointer"
            >
              <option value="position">Sort: Manual Order</option>
              <option value="priority">Sort: Priority</option>
              <option value="estimate">Sort: Estimate Points</option>
            </select>
          </div>

          {canEdit && (
            <button
              type="button"
              onClick={() => onOpenNewIssueModal(boardLists[0]?.id)}
              className="h-8 px-3 rounded-[var(--radius-sm)] bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white text-[13px] font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Issue</span>
              <Kbd className="!bg-black/25 !text-white !border-white/20">C</Kbd>
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Multi-Column Drag and Drop Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-5 flex items-stretch gap-4">
          {groupBy === 'status' ? (
            <>
              {boardLists.map((list: BoardListRecord) => {
                const colIssues = filteredBoardIssues.filter(
                  (i) => i.listId === list.id
                );
                return (
                  <DroppableBoardColumn
                    key={list.id}
                    id={list.id}
                    title={list.title}
                    color={list.color}
                    issues={colIssues}
                    inspectedIssueId={inspectedIssueId}
                    canEdit={canEdit}
                    onSelectIssue={(id) => setInspectedIssueId(id)}
                    onAddIssue={() => onOpenNewIssueModal(list.id)}
                    onRenameList={(newTitle) => renameList(list.id, newTitle)}
                    onDeleteList={() => deleteList(list.id)}
                    onKeyboardMoveColumn={handleKeyboardMoveColumn}
                  />
                );
              })}

              {/* Add New Column Button */}
              {canEdit && (
                <div className="w-[280px] shrink-0">
                  {addingList ? (
                    <form
                      onSubmit={handleAddListSubmit}
                      className="bg-[var(--bg-surface-1)] border border-[var(--border-strong)] rounded-[var(--radius-md)] p-3 space-y-2.5"
                    >
                      <input
                        type="text"
                        autoFocus
                        value={newListTitle}
                        onChange={(e) => setNewListTitle(e.target.value)}
                        placeholder="Column title (e.g. QA Review)..."
                        className="w-full h-8 px-2.5 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-[var(--radius-sm)] text-[13px] text-[var(--text-primary)] outline-none"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setAddingList(false)}
                          className="h-7 px-2.5 rounded-[var(--radius-sm)] text-[12px] text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="h-7 px-3 rounded-[var(--radius-sm)] bg-[var(--accent-primary)] text-white text-[12px] font-medium cursor-pointer"
                        >
                          Add List
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setAddingList(true)}
                      className="w-full h-[44px] px-4 rounded-[var(--radius-md)] border border-dashed border-[var(--border-strong)] hover:border-[var(--accent-primary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] text-[13px] font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Column List</span>
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Group By Assignee Columns */
            <>
              {members.map((member) => {
                const memberIssues = filteredBoardIssues.filter(
                  (i) => i.assigneeId === member.userId
                );
                return (
                  <DroppableBoardColumn
                    key={member.userId}
                    id={member.userId}
                    title={member.displayName}
                    color={member.color}
                    issues={memberIssues}
                    inspectedIssueId={inspectedIssueId}
                    canEdit={canEdit}
                    onSelectIssue={(id) => setInspectedIssueId(id)}
                    onAddIssue={() => onOpenNewIssueModal(boardLists[0]?.id)}
                    onKeyboardMoveColumn={handleKeyboardMoveColumn}
                  />
                );
              })}
            </>
          )}
        </div>

        {/* Lifted Card DragOverlay */}
        <DragOverlay>
          {activeDragIssue ? (
            <div className="w-[300px] rounded-[var(--radius-md)] p-3.5 bg-[var(--bg-surface-3)] border-2 border-[var(--accent-primary)] shadow-2xl rotate-1 opacity-95 select-none">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <PrioritySignal priority={activeDragIssue.priority} />
                  <span className="font-mono-id text-[12px] font-medium text-[var(--accent-primary)]">
                    {activeDragIssue.identifier}
                  </span>
                </div>
                <span className="font-mono-id text-[12px] text-[var(--text-muted)]">
                  {activeDragIssue.estimate}pt
                </span>
              </div>
              <h4 className="text-[14px] font-medium text-[var(--text-primary)] line-clamp-2">
                {activeDragIssue.title}
              </h4>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
