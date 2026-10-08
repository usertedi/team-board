import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  LayoutGrid,
  Sun,
  Moon,
  X,
  FolderKanban,
  Users,
  Check,
} from 'lucide-react';
import { useTeamBoards } from '../contexts/TeamBoardsContext';
import {
  BoardTemplate,
  IssuePriority,
  PRIORITY_META,
  TEMPLATE_LISTS,
} from '../types/teamBoards';
import { Kbd } from './BrandAndPrimitives';
import { PrioritySignal } from './KanbanBoardScreen';

/**
 * Command Palette (Ctrl/Cmd+K)
 * Jump to board or issue, create issue, create board, toggle theme.
 */
export const CommandPaletteModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onOpenBoard: (boardId: string) => void;
  onOpenNewIssue: () => void;
  onOpenNewBoard: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}> = ({
  isOpen,
  onClose,
  onOpenBoard,
  onOpenNewIssue,
  onOpenNewBoard,
  theme,
  onToggleTheme,
}) => {
  const { boards, issues, openIssueByIdentifier } = useTeamBoards();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const actions = [
    {
      id: 'act-new-issue',
      label: 'Create New Issue',
      shortcut: 'C',
      icon: <Plus className="w-4 h-4 text-[var(--accent-primary)]" />,
      run: () => {
        onClose();
        onOpenNewIssue();
      },
    },
    {
      id: 'act-new-board',
      label: 'Create New Board from Template',
      shortcut: 'N',
      icon: <FolderKanban className="w-4 h-4 text-[var(--accent-primary)]" />,
      run: () => {
        onClose();
        onOpenNewBoard();
      },
    },
    {
      id: 'act-theme',
      label: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`,
      shortcut: 'T',
      icon:
        theme === 'dark' ? (
          <Sun className="w-4 h-4 text-[#E5A83B]" />
        ) : (
          <Moon className="w-4 h-4 text-[var(--accent-primary)]" />
        ),
      run: () => {
        onToggleTheme();
        onClose();
      },
    },
  ].filter((a) => a.label.toLowerCase().includes(query.toLowerCase()));

  const matchingBoards = boards
    .filter(
      (b) =>
        !b.archived &&
        (b.title.toLowerCase().includes(query.toLowerCase()) ||
          b.teamKey.toLowerCase().includes(query.toLowerCase()))
    )
    .slice(0, 4);

  const matchingIssues = issues
    .filter(
      (i) =>
        i.identifier.toLowerCase().includes(query.toLowerCase()) ||
        i.title.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 6);

  const totalCount =
    actions.length + matchingBoards.length + matchingIssues.length;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (totalCount > 0 ? (prev + 1) % totalCount : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) =>
        totalCount > 0 ? (prev - 1 + totalCount) % totalCount : 0
      );
    } else if (e.key === 'Enter' && totalCount > 0) {
      e.preventDefault();
      if (activeIndex < actions.length) {
        actions[activeIndex].run();
      } else if (activeIndex < actions.length + matchingBoards.length) {
        const b = matchingBoards[activeIndex - actions.length];
        if (b) {
          onOpenBoard(b.id);
          onClose();
        }
      } else {
        const iss =
          matchingIssues[
            activeIndex - actions.length - matchingBoards.length
          ];
        if (iss) {
          openIssueByIdentifier(iss.identifier);
          onOpenBoard(iss.boardId);
          onClose();
        }
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center pt-[12vh] p-4 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-modal="true"
        aria-label="Command Palette"
        className="w-full max-w-[580px] bg-[var(--bg-surface-1)] border border-[var(--border-strong)] rounded-[var(--radius-lg)] shadow-2xl overflow-hidden"
      >
        <div className="h-[48px] px-4 border-b border-[var(--border-subtle)] flex items-center gap-3 bg-[var(--bg-surface-2)]">
          <Search className="w-4 h-4 text-[var(--accent-primary)] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            placeholder="Jump to board, issue (ENG-1), or run a command..."
            className="w-full bg-transparent text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none"
          />
          <Kbd>Esc</Kbd>
        </div>

        <div className="max-h-[380px] overflow-y-auto p-2 space-y-3">
          {actions.length > 0 && (
            <div>
              <div className="px-2.5 py-1 text-[12px] font-semibold text-[var(--text-muted)]">
                Quick Actions
              </div>
              {actions.map((act, idx) => (
                <button
                  key={act.id}
                  type="button"
                  onClick={act.run}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={`w-full h-9 px-3 rounded-[var(--radius-sm)] flex items-center justify-between text-[14px] cursor-pointer ${
                    activeIndex === idx
                      ? 'bg-[var(--bg-selected)] text-[var(--text-primary)]'
                      : 'text-[var(--text-secondary)]'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    {act.icon}
                    <span>{act.label}</span>
                  </span>
                  <Kbd>{act.shortcut}</Kbd>
                </button>
              ))}
            </div>
          )}

          {matchingBoards.length > 0 && (
            <div>
              <div className="px-2.5 py-1 text-[12px] font-semibold text-[var(--text-muted)]">
                Boards
              </div>
              {matchingBoards.map((b, idx) => {
                const itemIdx = actions.length + idx;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      onOpenBoard(b.id);
                      onClose();
                    }}
                    onMouseEnter={() => setActiveIndex(itemIdx)}
                    className={`w-full h-9 px-3 rounded-[var(--radius-sm)] flex items-center justify-between text-[14px] cursor-pointer ${
                      activeIndex === itemIdx
                        ? 'bg-[var(--bg-selected)] text-[var(--text-primary)]'
                        : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 truncate">
                      <LayoutGrid className="w-4 h-4 text-[var(--text-muted)]" />
                      <span className="font-mono-id text-[12px] text-[var(--accent-primary)] font-semibold">
                        {b.teamKey}
                      </span>
                      <span className="truncate">{b.title}</span>
                    </span>
                    <span className="text-[12px] text-[var(--text-muted)]">
                      Jump to board
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {matchingIssues.length > 0 && (
            <div>
              <div className="px-2.5 py-1 text-[12px] font-semibold text-[var(--text-muted)]">
                Issues
              </div>
              {matchingIssues.map((iss, idx) => {
                const itemIdx =
                  actions.length + matchingBoards.length + idx;
                return (
                  <button
                    key={iss.id}
                    type="button"
                    onClick={() => {
                      openIssueByIdentifier(iss.identifier);
                      onOpenBoard(iss.boardId);
                      onClose();
                    }}
                    onMouseEnter={() => setActiveIndex(itemIdx)}
                    className={`w-full h-9 px-3 rounded-[var(--radius-sm)] flex items-center justify-between gap-3 text-[14px] cursor-pointer ${
                      activeIndex === itemIdx
                        ? 'bg-[var(--bg-selected)] text-[var(--text-primary)]'
                        : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 min-w-0 truncate">
                      <PrioritySignal priority={iss.priority} />
                      <span className="font-mono-id text-[12px] text-[var(--accent-primary)] font-semibold shrink-0">
                        {iss.identifier}
                      </span>
                      <span className="truncate">{iss.title}</span>
                    </span>
                    <span className="font-mono-id text-[12px] text-[var(--text-muted)] shrink-0">
                      {iss.estimate}pt
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Create Issue Modal (Shortcut C)
 */
export const CreateIssueModal: React.FC<{
  isOpen: boolean;
  defaultListId?: string;
  onClose: () => void;
  onCreatedIssue: (boardId: string, issueId: string) => void;
}> = ({ isOpen, defaultListId, onClose, onCreatedIssue }) => {
  const {
    boards,
    activeBoardId,
    lists,
    members,
    labels,
    createIssue,
  } = useTeamBoards();

  const [boardId, setBoardId] = useState(activeBoardId);
  const [listId, setListId] = useState(defaultListId || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<IssuePriority>('medium');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [estimate, setEstimate] = useState<number>(3);
  const [dueDate, setDueDate] = useState<string>('');
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setBoardId(activeBoardId);
      const bLists = lists
        .filter((l) => l.boardId === activeBoardId)
        .sort((a, b) => a.position - b.position);
      setListId(defaultListId || bLists[0]?.id || '');
      setTitle('');
      setDescription('');
      setSelectedLabels([]);
    }
  }, [isOpen, activeBoardId, defaultListId, lists]);

  if (!isOpen) return null;

  const boardLists = lists
    .filter((l) => l.boardId === boardId)
    .sort((a, b) => a.position - b.position);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const created = createIssue({
      boardId,
      listId: listId || boardLists[0]?.id,
      title,
      description,
      priority,
      assigneeId: assigneeId || null,
      estimate,
      dueDate: dueDate || null,
      labelIds: selectedLabels,
    });
    onClose();
    if (created) {
      onCreatedIssue(created.boardId, created.id);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-issue-title"
        className="w-full max-w-[540px] bg-[var(--bg-surface-1)] border border-[var(--border-strong)] rounded-[var(--radius-lg)] p-6 shadow-2xl space-y-4"
      >
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
          <h2
            id="create-issue-title"
            className="text-[16px] font-semibold text-[var(--text-primary)]"
          >
            New Issue
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="new-issue-title"
              className="block text-[12px] font-medium text-[var(--text-secondary)]"
            >
              Issue Title
            </label>
            <input
              id="new-issue-title"
              type="text"
              autoFocus
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Finalize keynote slides, launch campaign video, or review Q4 budget..."
              className="w-full h-10 px-3 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] text-[14px] text-[var(--text-primary)] outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="new-issue-desc"
              className="block text-[12px] font-medium text-[var(--text-secondary)]"
            >
              Description (Markdown)
            </label>
            <textarea
              id="new-issue-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add project notes, checklist items, links, or deliverables..."
              className="w-full p-3 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] text-[14px] text-[var(--text-primary)] outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[12px] text-[var(--text-muted)] mb-1">
                Board
              </label>
              <select
                value={boardId}
                onChange={(e) => {
                  const nextB = e.target.value;
                  setBoardId(nextB);
                  const firstL = lists.find((l) => l.boardId === nextB);
                  if (firstL) setListId(firstL.id);
                }}
                className="w-full h-9 px-2.5 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] text-[13px] text-[var(--text-primary)] outline-none"
              >
                {boards
                  .filter((b) => !b.archived)
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.teamKey} · {b.title}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] text-[var(--text-muted)] mb-1">
                Status List
              </label>
              <select
                value={listId}
                onChange={(e) => setListId(e.target.value)}
                className="w-full h-9 px-2.5 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] text-[13px] text-[var(--text-primary)] outline-none"
              >
                {boardLists.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] text-[var(--text-muted)] mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as IssuePriority)}
                className="w-full h-9 px-2.5 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] text-[13px] text-[var(--text-primary)] outline-none"
              >
                {Object.entries(PRIORITY_META).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] text-[var(--text-muted)] mb-1">
                Assignee
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full h-9 px-2.5 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] text-[13px] text-[var(--text-primary)] outline-none"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.displayName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] text-[var(--text-muted)] mb-1">
                Estimate
              </label>
              <select
                value={estimate}
                onChange={(e) => setEstimate(Number(e.target.value))}
                className="w-full h-9 px-2.5 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] font-mono-id text-[13px] text-[var(--text-primary)] outline-none"
              >
                {[0, 1, 2, 3, 5, 8, 13].map((p) => (
                  <option key={p} value={p}>
                    {p} pts
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] text-[var(--text-muted)] mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full h-9 px-2.5 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] font-mono-id text-[13px] text-[var(--text-primary)] outline-none"
              />
            </div>
          </div>

          {/* Label Picker */}
          <div className="space-y-1.5">
            <span className="block text-[12px] text-[var(--text-muted)]">
              Labels
            </span>
            <div className="flex flex-wrap gap-1.5">
              {labels.map((lbl) => {
                const active = selectedLabels.includes(lbl.id);
                return (
                  <button
                    key={lbl.id}
                    type="button"
                    onClick={() =>
                      setSelectedLabels((prev) =>
                        prev.includes(lbl.id)
                          ? prev.filter((id) => id !== lbl.id)
                          : [...prev, lbl.id]
                      )
                    }
                    className={`h-7 px-2.5 rounded-[var(--radius-sm)] text-[12px] font-medium flex items-center gap-1.5 border cursor-pointer ${
                      active
                        ? 'bg-[var(--bg-selected)] border-[var(--accent-primary)] text-[var(--text-primary)]'
                        : 'bg-[var(--bg-surface-2)] border-[var(--border-subtle)] text-[var(--text-muted)]'
                    }`}
                  >
                    <span
                      style={{ backgroundColor: lbl.color }}
                      className="w-2 h-2 rounded-full"
                    />
                    <span>{lbl.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-3 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] text-[var(--text-secondary)] text-[13px] font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 px-4 rounded-[var(--radius-sm)] bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white text-[13px] font-medium cursor-pointer"
            >
              Create Issue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * Create Board with Templates Modal (Kanban, Sprint, Bug Tracker) + Create Team
 */
export const CreateBoardModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCreatedBoard: (boardId: string) => void;
}> = ({ isOpen, onClose, onCreatedBoard }) => {
  const { teams, createBoard, createTeam } = useTeamBoards();

  const [teamId, setTeamId] = useState(teams[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [template, setTemplate] = useState<BoardTemplate>('kanban');

  const [creatingNewTeam, setCreatingNewTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamKey, setNewTeamKey] = useState('');

  useEffect(() => {
    if (isOpen && teams.length > 0) {
      setTeamId(teams[0].id);
      setTitle('');
      setDescription('');
      setTemplate('kanban');
    }
  }, [isOpen, teams]);

  if (!isOpen) return null;

  const handleCreateTeamInline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim() || !newTeamKey.trim()) return;
    createTeam(newTeamName, newTeamKey, '#5E6AD2');
    setNewTeamName('');
    setNewTeamKey('');
    setCreatingNewTeam(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const created = createBoard({
      teamId: teamId || teams[0].id,
      title,
      description,
      template,
    });
    onClose();
    onCreatedBoard(created.id);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-board-modal-title"
        className="w-full max-w-[520px] bg-[var(--bg-surface-1)] border border-[var(--border-strong)] rounded-[var(--radius-lg)] p-6 shadow-2xl space-y-5"
      >
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
          <h2
            id="new-board-modal-title"
            className="text-[16px] font-semibold text-[var(--text-primary)]"
          >
            Create New Board
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Team Selection or Inline Team Creation */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-medium text-[var(--text-secondary)]">
                Team (Issue Key Prefix)
              </label>
              <button
                type="button"
                onClick={() => setCreatingNewTeam((s) => !s)}
                className="text-[12px] text-[var(--accent-primary)] hover:underline cursor-pointer"
              >
                {creatingNewTeam ? 'Select existing team' : '+ New Team'}
              </button>
            </div>

            {creatingNewTeam ? (
              <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] flex items-center gap-2">
                <input
                  type="text"
                  value={newTeamKey}
                  onChange={(e) =>
                    setNewTeamKey(e.target.value.toUpperCase().slice(0, 5))
                  }
                  placeholder="KEY (e.g. MKT, OPS)"
                  className="w-28 h-8 px-2 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] font-mono-id text-[12px] text-[var(--text-primary)] outline-none"
                />
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="Team name..."
                  className="flex-1 h-8 px-2 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] text-[13px] text-[var(--text-primary)] outline-none"
                />
                <button
                  type="button"
                  onClick={handleCreateTeamInline}
                  className="h-8 px-3 rounded-[var(--radius-sm)] bg-[var(--accent-primary)] text-white text-[12px] font-medium cursor-pointer"
                >
                  Save Team
                </button>
              </div>
            ) : (
              <select
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                className="w-full h-9 px-3 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] text-[14px] text-[var(--text-primary)] outline-none"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    [{t.key}] {t.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="board-title-input"
              className="block text-[12px] font-medium text-[var(--text-secondary)]"
            >
              Board Title
            </label>
            <input
              id="board-title-input"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Autumn Campaign Launch, Community Summit, or Product Roadmap"
              className="w-full h-10 px-3 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] text-[14px] text-[var(--text-primary)] outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="board-desc-input"
              className="block text-[12px] font-medium text-[var(--text-secondary)]"
            >
              Description
            </label>
            <input
              id="board-desc-input"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief goal or scope for this board..."
              className="w-full h-9 px-3 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] text-[14px] text-[var(--text-primary)] outline-none"
            />
          </div>

          {/* Workflow Template Picker (Pre-creates Lists) */}
          <div className="space-y-2">
            <span className="block text-[12px] font-medium text-[var(--text-secondary)]">
              Workflow Template (Pre-creates Lists)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {(
                [
                  {
                    id: 'kanban',
                    name: 'Kanban Workflow',
                    desc: 'Ideas & Backlog → Todo → In Progress → In Review → Done',
                  },
                  {
                    id: 'sprint',
                    name: 'Milestone / Campaign',
                    desc: 'Planned → In Action → Review & Approval → Blocked → Completed',
                  },
                  {
                    id: 'bug_tracker',
                    name: 'Requests & Intake',
                    desc: 'Incoming / Triage → Confirmed → In Progress → Resolved',
                  },
                ] as const
              ).map((tpl) => {
                const selected = template === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setTemplate(tpl.id)}
                    className={`p-3 rounded-[var(--radius-md)] border text-left space-y-1 transition-colors cursor-pointer ${
                      selected
                        ? 'bg-[var(--bg-selected)] border-[var(--accent-primary)]'
                        : 'bg-[var(--bg-surface-2)] border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-semibold text-[var(--text-primary)]">
                        {tpl.name}
                      </span>
                      {selected && (
                        <Check className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                      )}
                    </div>
                    <p className="text-[12px] leading-[16px] text-[var(--text-muted)]">
                      {tpl.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-3 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] text-[var(--text-secondary)] text-[13px] font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 px-4 rounded-[var(--radius-sm)] bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white text-[13px] font-medium cursor-pointer"
            >
              Create Board
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
