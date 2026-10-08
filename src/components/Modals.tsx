import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Kanban,
  List,
  Flame,
  Inbox,
  Compass,
  X,
} from 'lucide-react';
import {
  ActiveScreen,
  Issue,
  IssuePriority,
  IssueStatus,
} from '../types';
import {
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  TEAM_MEMBERS,
  PROJECTS,
} from '../data';
import { Kbd, StatusGlyph, PriorityGlyph } from './Primitives';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  issues: Issue[];
  onSelectIssue: (issue: Issue) => void;
  onNavigate: (screen: ActiveScreen) => void;
  onOpenNewIssue: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  issues,
  onSelectIssue,
  onNavigate,
  onOpenNewIssue,
}) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const quickCommands = [
    {
      id: 'cmd-new',
      label: 'Create New Issue',
      shortcut: 'C',
      icon: <Plus className="w-3.5 h-3.5 text-[#5E6AD2]" />,
      action: () => {
        onClose();
        onOpenNewIssue();
      },
    },
    {
      id: 'cmd-board',
      label: 'Switch to Board View',
      shortcut: 'G B',
      icon: <Kanban className="w-3.5 h-3.5 text-[#908f9e]" />,
      action: () => {
        onNavigate('board');
        onClose();
      },
    },
    {
      id: 'cmd-list',
      label: 'Switch to High-Density Issue Grid',
      shortcut: 'G L',
      icon: <List className="w-3.5 h-3.5 text-[#908f9e]" />,
      action: () => {
        onNavigate('list');
        onClose();
      },
    },
    {
      id: 'cmd-cycles',
      label: 'Inspect Active Cycle 42 Burnup',
      shortcut: 'G C',
      icon: <Flame className="w-3.5 h-3.5 text-[#E5A83B]" />,
      action: () => {
        onNavigate('cycles');
        onClose();
      },
    },
    {
      id: 'cmd-triage',
      label: 'Open Triage Queue',
      shortcut: 'G T',
      icon: <Inbox className="w-3.5 h-3.5 text-[#908f9e]" />,
      action: () => {
        onNavigate('triage');
        onClose();
      },
    },
    {
      id: 'cmd-roadmap',
      label: 'View Q4 Engineering Initiatives',
      shortcut: 'G R',
      icon: <Compass className="w-3.5 h-3.5 text-[#908f9e]" />,
      action: () => {
        onNavigate('roadmap');
        onClose();
      },
    },
  ];

  const filteredCommands = quickCommands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  const filteredIssues = issues
    .filter(
      (i) =>
        i.id.toLowerCase().includes(query.toLowerCase()) ||
        i.title.toLowerCase().includes(query.toLowerCase()) ||
        i.labels.some((l) => l.toLowerCase().includes(query.toLowerCase()))
    )
    .slice(0, 6);

  const totalItems = filteredCommands.length + filteredIssues.length;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (totalItems > 0 ? (prev + 1) % totalItems : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) =>
        totalItems > 0 ? (prev - 1 + totalItems) % totalItems : 0
      );
    } else if (e.key === 'Enter' && totalItems > 0) {
      e.preventDefault();
      if (activeIndex < filteredCommands.length) {
        filteredCommands[activeIndex].action();
      } else {
        const issue = filteredIssues[activeIndex - filteredCommands.length];
        if (issue) {
          onSelectIssue(issue);
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
      className="fixed inset-0 z-50 bg-black/65 flex items-start justify-center pt-[12vh] px-4 select-none"
    >
      {/* Level 3 Popover Surface: #181B1F with crisp 0 4px 16px rgba(0,0,0,0.4) and rgba(255,255,255,0.12) border */}
      <div
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        className="w-full max-w-[580px] bg-[#181B1F] border border-white/[0.12] rounded-[8px] shadow-[0_4px_16px_rgba(0,0,0,0.4)] overflow-hidden"
      >
        {/* Search Input Header */}
        <div className="h-[44px] px-3.5 border-b border-white/[0.08] flex items-center gap-2.5 bg-[#0E1012]">
          <Search className="w-4 h-4 text-[#5E6AD2] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            placeholder="Type a command or search issues (e.g. SLT-104, CRDT)..."
            className="w-full bg-transparent type-body-md text-[#E6E8EB] placeholder-[#4E535B] outline-none"
          />
          <Kbd>ESC</Kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[360px] overflow-y-auto p-2 space-y-3">
          {filteredCommands.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#6E7681]">
                Workspace Actions
              </div>
              <div className="space-y-0.5">
                {filteredCommands.map((cmd, idx) => {
                  const isFocused = activeIndex === idx;
                  return (
                    <button
                      key={cmd.id}
                      onClick={cmd.action}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={`w-full h-[32px] px-2.5 rounded-[4px] flex items-center justify-between type-body-md transition-colors cursor-pointer ${
                        isFocused
                          ? 'bg-[#2E3466] text-white border border-[#5E6AD2]'
                          : 'text-[#c6c5d5] border border-transparent'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        {cmd.icon}
                        <span>{cmd.label}</span>
                      </span>
                      <Kbd>{cmd.shortcut}</Kbd>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {filteredIssues.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#6E7681]">
                Matching Issues
              </div>
              <div className="space-y-0.5">
                {filteredIssues.map((issue, idx) => {
                  const itemIndex = filteredCommands.length + idx;
                  const isFocused = activeIndex === itemIndex;
                  return (
                    <button
                      key={issue.id}
                      onClick={() => {
                        onSelectIssue(issue);
                        onClose();
                      }}
                      onMouseEnter={() => setActiveIndex(itemIndex)}
                      className={`w-full h-[34px] px-2.5 rounded-[4px] flex items-center justify-between gap-3 type-body-md transition-colors cursor-pointer ${
                        isFocused
                          ? 'bg-[#2E3466] text-white border border-[#5E6AD2]'
                          : 'text-[#c6c5d5] border border-transparent'
                      }`}
                    >
                      <span className="flex items-center gap-2 min-w-0 truncate">
                        <StatusGlyph status={issue.status} size={12} />
                        <span className="font-mono-tabular text-[11px] text-[#908f9e] shrink-0">
                          {issue.id}
                        </span>
                        <span className="truncate">{issue.title}</span>
                      </span>
                      <span className="flex items-center gap-2 shrink-0">
                        <PriorityGlyph priority={issue.priority} size={12} />
                        <span className="font-mono-tabular text-[11px] text-[#6E7681]">
                          {issue.estimate}pt
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {totalItems === 0 && (
            <div className="py-8 text-center text-[13px] text-[#6E7681]">
              No matching commands or issues for "{query}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface NewIssueModalProps {
  isOpen: boolean;
  initialStatus?: IssueStatus;
  onClose: () => void;
  onCreateIssue: (newIssue: {
    title: string;
    description: string;
    status: IssueStatus;
    priority: IssuePriority;
    assigneeId: string | null;
    projectId: string;
    estimate: number;
    labels: string[];
  }) => void;
}

export const NewIssueModal: React.FC<NewIssueModalProps> = ({
  isOpen,
  initialStatus = 'todo',
  onClose,
  onCreateIssue,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<IssueStatus>(initialStatus);
  const [priority, setPriority] = useState<IssuePriority>('high');
  const [assigneeId, setAssigneeId] = useState<string>(TEAM_MEMBERS[0].id);
  const [projectId, setProjectId] = useState<string>(PROJECTS[0].id);
  const [estimate, setEstimate] = useState<number>(3);
  const [labelInput, setLabelInput] = useState('Sync Engine');

  useEffect(() => {
    if (isOpen) {
      setStatus(initialStatus);
      setTitle('');
      setDescription('');
    }
  }, [isOpen, initialStatus]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreateIssue({
      title: title.trim(),
      description:
        description.trim() ||
        'Engineering specification pending triage review.',
      status,
      priority,
      assigneeId: assigneeId || null,
      projectId,
      estimate,
      labels: labelInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    });
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/65 flex items-center justify-center p-4 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[540px] bg-[#181B1F] border border-white/[0.12] rounded-[8px] shadow-[0_4px_16px_rgba(0,0,0,0.4)] overflow-hidden"
      >
        <div className="h-[40px] px-4 border-b border-white/[0.08] flex items-center justify-between bg-[#0C0D0E]">
          <div className="flex items-center gap-2 text-[12px] text-[#c6c5d5]">
            <span className="w-2 h-2 rounded-full bg-[#5E6AD2]" />
            <span className="font-medium">Create New Engineering Issue</span>
          </div>
          <button
            onClick={onClose}
            className="text-[#908f9e] hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <input
              type="text"
              autoFocus
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Issue title (e.g. Optimize IndexedDB cursor batching)..."
              className="w-full h-[32px] px-2.5 bg-[#0E1012] border border-white/[0.08] focus:border-[#5E6AD2] focus:shadow-[0_0_0_1px_#5E6AD2] rounded-[4px] type-headline-sm text-[#E6E8EB] placeholder-[#4E535B] outline-none"
            />
          </div>

          <div>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add technical context, reproduction steps, or telemetry budgets..."
              className="w-full p-2.5 bg-[#0E1012] border border-white/[0.08] focus:border-[#5E6AD2] rounded-[4px] type-body-md text-[#E6E8EB] placeholder-[#4E535B] outline-none resize-none"
            />
          </div>

          {/* Compact Property Selectors */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
            <div>
              <label className="block text-[11px] text-[#6E7681] mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as IssueStatus)}
                className="w-full h-[28px] px-2 bg-[#0E1012] border border-white/[0.08] rounded-[4px] type-label-sm text-[#e3e2e3] outline-none"
              >
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-[#6E7681] mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as IssuePriority)}
                className="w-full h-[28px] px-2 bg-[#0E1012] border border-white/[0.08] rounded-[4px] type-label-sm text-[#e3e2e3] outline-none"
              >
                {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-[#6E7681] mb-1">
                Estimate (Pts)
              </label>
              <select
                value={estimate}
                onChange={(e) => setEstimate(Number(e.target.value))}
                className="w-full h-[28px] px-2 bg-[#0E1012] border border-white/[0.08] rounded-[4px] font-mono-tabular type-label-sm text-[#e3e2e3] outline-none"
              >
                {[1, 2, 3, 5, 8, 13].map((p) => (
                  <option key={p} value={p}>
                    {p} Points
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-[#6E7681] mb-1">
                Assignee
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full h-[28px] px-2 bg-[#0E1012] border border-white/[0.08] rounded-[4px] type-label-sm text-[#e3e2e3] outline-none"
              >
                {TEAM_MEMBERS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-[#6E7681] mb-1">
                Core Stream
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full h-[28px] px-2 bg-[#0E1012] border border-white/[0.08] rounded-[4px] type-label-sm text-[#e3e2e3] outline-none"
              >
                {PROJECTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-[#6E7681] mb-1">
                Domain Tag
              </label>
              <input
                type="text"
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                className="w-full h-[28px] px-2 bg-[#0E1012] border border-white/[0.08] rounded-[4px] type-label-sm text-[#e3e2e3] outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
            <span className="text-[11px] text-[#6E7681]">
              Assigned to active Cycle 42
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="h-[28px] px-3 bg-white/[0.03] hover:bg-white/[0.06] text-[#D0D6E0] border border-white/[0.08] rounded-[4px] type-label-md cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-[28px] px-3 bg-[#5E6AD2] hover:bg-[#4D58BF] text-white border border-white/10 rounded-[4px] type-label-md cursor-pointer"
              >
                Create Issue
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
