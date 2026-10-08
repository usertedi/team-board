export type MemberRole = 'owner' | 'admin' | 'member' | 'viewer';

export type BoardTemplate = 'kanban' | 'sprint' | 'bug_tracker';

export type IssuePriority = 'none' | 'low' | 'medium' | 'high' | 'urgent';

export interface WorkspaceRecord {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  createdAt: string;
}

export interface WorkspaceMemberRecord {
  workspaceId: string;
  userId: string;
  role: MemberRole;
  displayName: string;
  initials: string;
  color: string;
  title?: string;
  joinedAt: string;
}

export interface TeamRecord {
  id: string;
  workspaceId: string;
  key: string; // e.g., "ENG", "DES", "INF"
  name: string;
  color: string;
  issueCounter: number;
  createdAt: string;
}

export interface BoardRecord {
  id: string;
  workspaceId: string;
  teamId: string;
  teamKey: string;
  title: string;
  description: string;
  template: BoardTemplate;
  archived: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface BoardListRecord {
  id: string;
  workspaceId: string;
  boardId: string;
  title: string;
  color: string;
  position: number;
  isDoneList: boolean;
}

export interface LabelRecord {
  id: string;
  workspaceId: string;
  name: string;
  color: string;
}

export interface IssueRecord {
  id: string;
  workspaceId: string;
  teamId: string;
  boardId: string;
  listId: string;
  number: number;
  identifier: string; // e.g., "ENG-1", "ENG-2"
  title: string;
  description: string; // Markdown supported
  priority: IssuePriority;
  assigneeId: string | null;
  estimate: number;
  dueDate: string | null;
  position: number; // Fractional position for single-row DnD updates
  labelIds: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommentRecord {
  id: string;
  workspaceId: string;
  issueId: string;
  authorId: string;
  authorName: string;
  authorInitials: string;
  authorColor: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityRecord {
  id: string;
  workspaceId: string;
  boardId?: string;
  issueId?: string;
  issueIdentifier?: string;
  actorId: string;
  actorName: string;
  actorInitials: string;
  actorColor: string;
  action: string;
  detail: string;
  createdAt: string;
}

export interface InviteRecord {
  id: string;
  workspaceId: string;
  workspaceName: string;
  token: string;
  role: MemberRole;
  createdBy: string;
  createdAt: string;
  acceptedBy?: string;
}

export interface NotificationRecord {
  id: string;
  workspaceId: string;
  recipientId: string;
  actorName: string;
  type: 'assigned' | 'commented' | 'mentioned';
  issueId: string;
  issueIdentifier: string;
  boardId: string;
  title: string;
  read: boolean;
  createdAt: string;
}

export interface PinRecord {
  id: string;
  workspaceId: string;
  userId: string;
  boardId: string;
  createdAt: string;
}

export interface PresenceRecord {
  id: string;
  workspaceId: string;
  boardId: string;
  userId: string;
  displayName: string;
  initials: string;
  color: string;
  lastSeen: string;
}

export const PRIORITY_META: Record<
  IssuePriority,
  { label: string; color: string; order: number; bars: number }
> = {
  urgent: { label: 'Urgent', color: '#EB5757', order: 4, bars: 4 },
  high: { label: 'High', color: '#E5A83B', order: 3, bars: 3 },
  medium: { label: 'Medium', color: '#5E6AD2', order: 2, bars: 2 },
  low: { label: 'Low', color: '#8A8F98', order: 1, bars: 1 },
  none: { label: 'No Priority', color: '#64748B', order: 0, bars: 0 },
};

export const TEMPLATE_LISTS: Record<
  BoardTemplate,
  { title: string; color: string; isDoneList: boolean }[]
> = {
  kanban: [
    { title: 'Ideas & Backlog', color: '#8A8F98', isDoneList: false },
    { title: 'Todo', color: '#C6C5D5', isDoneList: false },
    { title: 'In Progress', color: '#E5A83B', isDoneList: false },
    { title: 'In Review', color: '#5E6AD2', isDoneList: false },
    { title: 'Done', color: '#27C383', isDoneList: true },
  ],
  sprint: [
    { title: 'Planned', color: '#C6C5D5', isDoneList: false },
    { title: 'In Action', color: '#E5A83B', isDoneList: false },
    { title: 'Review & Approval', color: '#5E6AD2', isDoneList: false },
    { title: 'Blocked', color: '#EB5757', isDoneList: false },
    { title: 'Completed', color: '#27C383', isDoneList: true },
  ],
  bug_tracker: [
    { title: 'Incoming / Triage', color: '#8A8F98', isDoneList: false },
    { title: 'Confirmed', color: '#EB5757', isDoneList: false },
    { title: 'In Progress', color: '#E5A83B', isDoneList: false },
    { title: 'Ready for Review', color: '#5E6AD2', isDoneList: false },
    { title: 'Resolved', color: '#27C383', isDoneList: true },
  ],
};
