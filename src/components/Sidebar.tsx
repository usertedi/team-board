import React from 'react';
import {
  Kanban,
  List,
  Flame,
  Inbox,
  Compass,
  FolderGit2,
  Plus,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  SlidersHorizontal,
} from 'lucide-react';
import { ActiveScreen, Project } from '../types';
import { Kbd, MemberAvatar } from './Primitives';
import { TEAM_MEMBERS } from '../data';

interface SidebarProps {
  activeScreen: ActiveScreen;
  onSelectScreen: (screen: ActiveScreen) => void;
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (projectId: string | null) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenCommandPalette: () => void;
  onOpenNewIssue: () => void;
  counts: {
    all: number;
    triage: number;
    cycleActive: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeScreen,
  onSelectScreen,
  projects,
  activeProjectId,
  onSelectProject,
  collapsed,
  onToggleCollapse,
  onOpenCommandPalette,
  onOpenNewIssue,
  counts,
}) => {
  const navItems: {
    id: ActiveScreen;
    label: string;
    icon: React.ReactNode;
    shortcut: string;
    count?: number;
  }[] = [
    {
      id: 'board',
      label: 'Board View',
      icon: <Kanban className="w-3.5 h-3.5" />,
      shortcut: 'G B',
      count: counts.all,
    },
    {
      id: 'list',
      label: 'Issue Grid',
      icon: <List className="w-3.5 h-3.5" />,
      shortcut: 'G L',
      count: counts.all,
    },
    {
      id: 'cycles',
      label: 'Active Cycle',
      icon: <Flame className="w-3.5 h-3.5" />,
      shortcut: 'G C',
      count: counts.cycleActive,
    },
    {
      id: 'triage',
      label: 'Triage Queue',
      icon: <Inbox className="w-3.5 h-3.5" />,
      shortcut: 'G T',
      count: counts.triage,
    },
    {
      id: 'roadmap',
      label: 'Initiatives',
      icon: <Compass className="w-3.5 h-3.5" />,
      shortcut: 'G R',
    },
  ];

  if (collapsed) {
    return (
      <aside className="w-[48px] bg-[#0C0D0E] border-r border-white/[0.08] flex flex-col items-center py-3 justify-between shrink-0 select-none z-20">
        <div className="flex flex-col items-center gap-3 w-full">
          <button
            onClick={onToggleCollapse}
            title="Expand sidebar ([)"
            className="w-7 h-7 rounded-[4px] bg-[#5E6AD2]/15 border border-[#5E6AD2]/40 flex items-center justify-center text-[#bdc2ff] hover:bg-[#5E6AD2]/25 transition-colors"
          >
            <PanelLeftOpen className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onOpenNewIssue}
            title="New Issue (C)"
            className="w-7 h-7 rounded-[4px] bg-[#5E6AD2] hover:bg-[#4D58BF] text-white flex items-center justify-center border border-white/10 transition-transform active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          <div className="w-6 h-[1px] bg-white/[0.08] my-0.5" />

          <nav className="flex flex-col items-center gap-1.5 w-full px-1.5">
            {navItems.map((item) => {
              const active = activeScreen === item.id && activeProjectId === null;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectProject(null);
                    onSelectScreen(item.id);
                  }}
                  title={`${item.label} (${item.shortcut})`}
                  className={`w-8 h-8 rounded-[4px] flex items-center justify-center transition-colors ${
                    active
                      ? 'bg-[#2E3466] text-[#dfe0ff] border border-[#5E6AD2]/50'
                      : 'text-[#908f9e] hover:text-[#e3e2e3] hover:bg-white/[0.04]'
                  }`}
                >
                  {item.icon}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-col items-center gap-2">
          <button
            onClick={onOpenCommandPalette}
            title="Command Palette (⌘K)"
            className="w-8 h-8 rounded-[4px] flex items-center justify-center text-[#908f9e] hover:text-white hover:bg-white/[0.04]"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
          <MemberAvatar
            initials={TEAM_MEMBERS[0].initials}
            color={TEAM_MEMBERS[0].color}
            name={TEAM_MEMBERS[0].name}
            size="sm"
          />
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-[240px] bg-[#0C0D0E] border-r border-white/[0.08] flex flex-col justify-between shrink-0 select-none z-20">
      {/* Top Workspace Header & Quick Actions */}
      <div className="p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-5 h-5 rounded-[4px] bg-[#5E6AD2] flex items-center justify-center text-[11px] font-bold text-white tracking-tighter shrink-0">
              PS
            </div>
            <span className="font-display font-semibold text-[13px] text-[#e3e2e3] tracking-tight truncate">
              Precision Slate
            </span>
          </div>
          <button
            onClick={onToggleCollapse}
            title="Collapse sidebar ([)"
            className="w-6 h-6 rounded-[4px] text-[#908f9e] hover:text-[#e3e2e3] hover:bg-white/[0.04] flex items-center justify-center transition-colors"
          >
            <PanelLeftClose className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* New Issue + Search Bar */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenNewIssue}
            className="flex-1 h-[28px] px-2.5 bg-[#5E6AD2] hover:bg-[#4D58BF] active:scale-[0.99] text-white border border-white/10 rounded-[4px] type-label-md flex items-center justify-between transition-all cursor-pointer"
          >
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <Plus className="w-3.5 h-3.5" />
              <span>New Issue</span>
            </span>
            <Kbd className="!bg-black/25 !border-white/20 !text-white/90">C</Kbd>
          </button>

          <button
            onClick={onOpenCommandPalette}
            title="Command Palette (⌘K)"
            className="h-[28px] px-2 bg-white/[0.03] hover:bg-white/[0.06] text-[#D0D6E0] hover:text-white border border-white/[0.08] rounded-[4px] flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <Search className="w-3.5 h-3.5 text-[#908f9e]" />
            <Kbd>⌘K</Kbd>
          </button>
        </div>

        {/* Primary Workspace Views */}
        <div className="space-y-0.5 pt-1">
          <div className="px-2 py-1 text-[11px] font-medium text-[#6E7681] tracking-wide">
            Workspace Views
          </div>
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = activeScreen === item.id && activeProjectId === null;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectProject(null);
                    onSelectScreen(item.id);
                  }}
                  className={`w-full h-[28px] px-2 rounded-[4px] flex items-center justify-between type-label-md transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#2E3466]/80 text-[#dfe0ff] border border-[#5E6AD2]/40'
                      : 'text-[#c6c5d5] hover:bg-white/[0.04] hover:text-white border border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <span className={isActive ? 'text-[#bdc2ff]' : 'text-[#908f9e]'}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </span>
                  <span className="flex items-center gap-1.5 shrink-0">
                    {item.count !== undefined && (
                      <span className="text-[11px] font-mono-tabular text-[#908f9e]">
                        {item.count}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Active Engineering Projects */}
        <div className="space-y-0.5 pt-2 border-t border-white/[0.06]">
          <div className="px-2 py-1 flex items-center justify-between text-[11px] font-medium text-[#6E7681]">
            <span>Core Streams</span>
            <span className="font-mono-tabular">{projects.length}</span>
          </div>
          <div className="space-y-0.5">
            {projects.map((proj) => {
              const isSelected = activeProjectId === proj.id;
              return (
                <button
                  key={proj.id}
                  onClick={() => {
                    onSelectProject(isSelected ? null : proj.id);
                    if (activeScreen !== 'board' && activeScreen !== 'list') {
                      onSelectScreen('board');
                    }
                  }}
                  className={`w-full h-[28px] px-2 rounded-[4px] flex items-center justify-between type-body-sm transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#2E3466]/80 text-white border border-[#5E6AD2]/40'
                      : 'text-[#c6c5d5] hover:bg-white/[0.04] hover:text-white border border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <FolderGit2
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isSelected ? 'text-[#bdc2ff]' : 'text-[#6E7681]'
                      }`}
                    />
                    <span className="truncate">{proj.name}</span>
                  </span>
                  <span className="text-[10px] font-mono-tabular text-[#6E7681] shrink-0">
                    {proj.progress}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Keyboard Legend & User Profile */}
      <div className="p-3 border-t border-white/[0.08] space-y-2.5 bg-[#08090A]/40">
        <div className="px-2 py-1.5 rounded-[4px] bg-[#121417] border border-white/[0.06] space-y-1">
          <div className="flex items-center justify-between text-[11px] text-[#908f9e]">
            <span className="flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3 text-[#5E6AD2]" />
              <span>Keyboard Nav</span>
            </span>
            <div className="flex items-center gap-1">
              <Kbd>J</Kbd>
              <Kbd>K</Kbd>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#908f9e]">
            <span>Quick Status</span>
            <div className="flex items-center gap-1">
              <Kbd>1</Kbd>
              <span className="text-[10px]">–</span>
              <Kbd>6</Kbd>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 min-w-0">
            <MemberAvatar
              initials={TEAM_MEMBERS[0].initials}
              color={TEAM_MEMBERS[0].color}
              name={TEAM_MEMBERS[0].name}
              size="sm"
            />
            <div className="truncate">
              <div className="type-label-md text-[#e3e2e3] truncate">
                {TEAM_MEMBERS[0].name}
              </div>
              <div className="text-[11px] text-[#6E7681] truncate">
                {TEAM_MEMBERS[0].role}
              </div>
            </div>
          </div>
          <Kbd>?</Kbd>
        </div>
      </div>
    </aside>
  );
};
