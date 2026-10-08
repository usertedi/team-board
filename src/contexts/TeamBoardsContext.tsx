import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import {
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import { useQueryClient } from '@tanstack/react-query';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import {
  WorkspaceRecord,
  WorkspaceMemberRecord,
  TeamRecord,
  BoardRecord,
  BoardListRecord,
  LabelRecord,
  IssueRecord,
  CommentRecord,
  ActivityRecord,
  InviteRecord,
  NotificationRecord,
  PinRecord,
  PresenceRecord,
  MemberRole,
  BoardTemplate,
  IssuePriority,
  TEMPLATE_LISTS,
} from '../types/teamBoards';
import {
  buildSeedBundle,
  buildCleanAccountBundle,
  SeedBundle,
} from '../data/seedTeamBoards';

interface TeamBoardsContextValue {
  // Data
  workspaces: WorkspaceRecord[];
  activeWorkspace: WorkspaceRecord;
  members: WorkspaceMemberRecord[];
  currentUserRole: MemberRole;
  canEdit: boolean;
  isAdminOrOwner: boolean;
  teams: TeamRecord[];
  boards: BoardRecord[];
  lists: BoardListRecord[];
  labels: LabelRecord[];
  issues: IssueRecord[];
  comments: CommentRecord[];
  activity: ActivityRecord[];
  invites: InviteRecord[];
  notifications: NotificationRecord[];
  pins: PinRecord[];
  presence: PresenceRecord[];
  isOnline: boolean;

  // Navigation & URL state
  activeBoardId: string;
  setActiveBoardId: (id: string) => void;
  inspectedIssueId: string | null;
  setInspectedIssueId: (id: string | null) => void;
  openIssueByIdentifier: (identifier: string) => void;

  // Actions — Workspaces, Roles & Invites
  selectWorkspace: (workspaceId: string) => void;
  createWorkspace: (name: string) => void;
  setMySimRole: (role: MemberRole) => void;
  updateMemberRole: (userId: string, role: MemberRole) => void;
  createTeam: (name: string, key: string, color: string) => void;
  createInvite: (role: MemberRole) => InviteRecord;
  acceptInviteToken: (token: string) => { success: boolean; message: string };

  // Actions — Boards & Lists
  createBoard: (payload: {
    teamId: string;
    title: string;
    description: string;
    template: BoardTemplate;
  }) => BoardRecord;
  toggleArchiveBoard: (boardId: string) => void;
  togglePinBoard: (boardId: string) => void;
  createList: (boardId: string, title: string, color?: string) => void;
  renameList: (listId: string, title: string) => void;
  deleteList: (listId: string) => void;

  // Actions — Issues, Drag & Drop, Labels, Comments, Notifications
  createIssue: (payload: {
    boardId: string;
    listId?: string;
    title: string;
    description: string;
    priority: IssuePriority;
    assigneeId: string | null;
    estimate: number;
    dueDate: string | null;
    labelIds: string[];
  }) => IssueRecord | null;
  updateIssue: (
    issueId: string,
    updates: Partial<
      Pick<
        IssueRecord,
        | 'title'
        | 'description'
        | 'listId'
        | 'priority'
        | 'assigneeId'
        | 'estimate'
        | 'dueDate'
        | 'position'
        | 'labelIds'
      >
    >,
    logAction?: { action: string; detail: string }
  ) => void;
  moveIssueOptimistic: (
    issueId: string,
    targetListId: string,
    newPosition: number
  ) => void;
  deleteIssue: (issueId: string) => void;
  createLabel: (name: string, color: string) => LabelRecord;
  addComment: (issueId: string, body: string) => void;
  updateComment: (commentId: string, body: string) => void;
  deleteComment: (commentId: string) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
}

const TeamBoardsContext = createContext<TeamBoardsContextValue | undefined>(
  undefined
);

const STORAGE_KEY = 'team_boards_state_v4';
const CHANNEL_NAME = 'team_boards_realtime_sync';

export const TeamBoardsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { profile, user, isLocalSession } = useAuth();
  const queryClient = useQueryClient();

  const currentUserId = profile?.uid || user?.uid || 'usr-demo-elena';
  const currentUserName = profile?.displayName || 'Elena Rostova';
  const currentUserInitials = profile?.initials || 'ER';
  const currentUserColor = profile?.color || '#5E6AD2';
  const currentUserTitle = profile?.title || 'Workspace Lead';
  const isDemoAccount = currentUserId === 'usr-demo-elena';

  const [bundle, setBundle] = useState<SeedBundle>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as SeedBundle;
        if (
          parsed &&
          Array.isArray(parsed.workspaces) &&
          parsed.workspaces.length > 0
        ) {
          return parsed;
        }
      }
    } catch {
      // ignore storage errors
    }
    // Always include the demo bundle in the store so demo invite tokens (tb_inv_9f8a7d6c5b4e) exist if a user pastes one,
    // but only add the current user as a member of the demo workspace if they logged in as the Demo Account!
    const demoBundle = buildSeedBundle(
      'usr-demo-elena',
      'Elena Rostova',
      'ER',
      '#5E6AD2'
    );
    if (isDemoAccount) {
      return demoBundle;
    }
    const cleanBundle = buildCleanAccountBundle(
      currentUserId,
      currentUserName,
      currentUserInitials,
      currentUserColor,
      currentUserTitle
    );
    return {
      workspaces: [...cleanBundle.workspaces, ...demoBundle.workspaces],
      members: [...cleanBundle.members, ...demoBundle.members],
      teams: [...cleanBundle.teams, ...demoBundle.teams],
      boards: [...cleanBundle.boards, ...demoBundle.boards],
      lists: [...cleanBundle.lists, ...demoBundle.lists],
      labels: [...cleanBundle.labels, ...demoBundle.labels],
      issues: [...cleanBundle.issues, ...demoBundle.issues],
      comments: [...cleanBundle.comments, ...demoBundle.comments],
      activity: [...cleanBundle.activity, ...demoBundle.activity],
      invites: [...cleanBundle.invites, ...demoBundle.invites],
      notifications: [...cleanBundle.notifications, ...demoBundle.notifications],
      pins: [...cleanBundle.pins, ...demoBundle.pins],
      presence: [...cleanBundle.presence, ...demoBundle.presence],
    };
  });

  // Workspaces where the current user is actually a member or owner
  const userWorkspaces = useMemo(() => {
    const myWsIds = new Set(
      bundle.members
        .filter((m) => m.userId === currentUserId)
        .map((m) => m.workspaceId)
    );
    return bundle.workspaces.filter(
      (w) => w.ownerId === currentUserId || myWsIds.has(w.id)
    );
  }, [bundle.workspaces, bundle.members, currentUserId]);

  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(
    () => userWorkspaces[0]?.id || bundle.workspaces[0]?.id || 'ws-horizon'
  );
  const [activeBoardId, setActiveBoardId] = useState<string>(
    () =>
      bundle.boards.find((b) => b.workspaceId === activeWorkspaceId)?.id || ''
  );
  const [inspectedIssueId, setInspectedIssueId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // Ensure every authenticated user has their own personal workspace if they are not yet involved in any workspace
  useEffect(() => {
    if (!profile) return;
    setBundle((prev) => {
      const myMemberships = prev.members.filter(
        (m) => m.userId === profile.uid
      );
      if (myMemberships.length > 0) {
        // Update profile details across workspaces the user belongs to
        return {
          ...prev,
          members: prev.members.map((m) =>
            m.userId === profile.uid
              ? {
                  ...m,
                  displayName: profile.displayName,
                  initials: profile.initials,
                  color: profile.color,
                  title: profile.title,
                }
              : m
          ),
        };
      }

      // Brand-new account that is not in any workspace yet -> provision a clean personal workspace
      const clean = buildCleanAccountBundle(
        profile.uid,
        profile.displayName,
        profile.initials,
        profile.color,
        profile.title || 'Workspace Lead'
      );
      const next = {
        ...prev,
        workspaces: [clean.workspaces[0], ...prev.workspaces],
        members: [...clean.members, ...prev.members],
        teams: [...clean.teams, ...prev.teams],
        labels: [...clean.labels, ...prev.labels],
        activity: [...clean.activity, ...prev.activity],
        presence: [...clean.presence, ...prev.presence],
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, [profile]);

  // Keep activeWorkspaceId pointed to a workspace the current user actually belongs to
  useEffect(() => {
    if (
      userWorkspaces.length > 0 &&
      !userWorkspaces.some((w) => w.id === activeWorkspaceId)
    ) {
      const nextWs = userWorkspaces[0];
      setActiveWorkspaceId(nextWs.id);
      const firstBoard = bundle.boards.find(
        (b) => b.workspaceId === nextWs.id && !b.archived
      );
      setActiveBoardId(firstBoard?.id || '');
      setInspectedIssueId(null);
    }
  }, [userWorkspaces, activeWorkspaceId, bundle.boards]);

  // Persist to localStorage & broadcast across tabs via BroadcastChannel for instant Realtime sync
  const persistAndBroadcast = useCallback(
    (updater: (prev: SeedBundle) => SeedBundle) => {
      setBundle((prev) => {
        const next = updater(prev);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          if (typeof BroadcastChannel !== 'undefined') {
            const bc = new BroadcastChannel(CHANNEL_NAME);
            bc.postMessage({ type: 'SYNC_BUNDLE', payload: next });
            bc.close();
          }
        } catch {
          // ignore
        }
        queryClient.invalidateQueries({ queryKey: ['workspace', activeWorkspaceId] });
        return next;
      });
    },
    [activeWorkspaceId, queryClient]
  );

  // Listen to online/offline & multi-tab BroadcastChannel + URL deep link parsing
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    let bc: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      bc = new BroadcastChannel(CHANNEL_NAME);
      bc.onmessage = (ev) => {
        if (ev.data?.type === 'SYNC_BUNDLE' && ev.data.payload) {
          setBundle(ev.data.payload);
        }
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (bc) bc.close();
    };
  }, []);

  // Optional Firestore Realtime Presence heartbeat when authenticated with verified Google user
  useEffect(() => {
    if (!user || !user.emailVerified || isLocalSession) return;
    const presId = `pres-${user.uid}`;
    const presRef = doc(
      db,
      'workspaces',
      activeWorkspaceId,
      'presence',
      presId
    );
    setDoc(
      presRef,
      {
        id: presId,
        workspaceId: activeWorkspaceId,
        boardId: activeBoardId,
        userId: user.uid,
        displayName: currentUserName.slice(0, 80),
        initials: currentUserInitials.slice(0, 4),
        color: currentUserColor,
        lastSeen: serverTimestamp(),
      },
      { merge: true }
    ).catch(() => {
      // Ignore if workspace hasn't been mirrored to Firestore yet
    });
  }, [
    user,
    isLocalSession,
    activeWorkspaceId,
    activeBoardId,
    currentUserName,
    currentUserInitials,
    currentUserColor,
  ]);

  // Sync URL `/boards/:boardId/issues/:identifier` on initial load and browser back/forward popstate only
  useEffect(() => {
    const parseUrl = () => {
      const path = window.location.pathname;
      const match = path.match(/^\/boards\/([^/]+)(?:\/issues\/([^/]+))?/);
      if (match) {
        const [, bId, ident] = match;
        const foundBoard = bundle.boards.find((b) => b.id === bId);
        if (foundBoard) {
          setActiveBoardId(foundBoard.id);
        }
        if (ident) {
          const foundIssue = bundle.issues.find(
            (i) =>
              i.identifier.toLowerCase() === ident.toLowerCase() ||
              String(i.number) === ident
          );
          if (foundIssue) {
            setInspectedIssueId(foundIssue.id);
          }
        } else {
          setInspectedIssueId(null);
        }
      }
    };
    window.addEventListener('popstate', parseUrl);
    return () => window.removeEventListener('popstate', parseUrl);
  }, [bundle.boards, bundle.issues]);

  // Update browser URL cleanly when board or inspected issue changes (preserving query params like ?invite=)
  useEffect(() => {
    const search = window.location.search || '';
    if (search.includes('invite=')) {
      return;
    }
    const issue = bundle.issues.find((i) => i.id === inspectedIssueId);
    const nextPath = issue
      ? `/boards/${issue.boardId}/issues/${issue.identifier}`
      : activeBoardId
      ? `/boards/${activeBoardId}`
      : '/';
    if (window.location.pathname !== nextPath) {
      window.history.replaceState({}, '', `${nextPath}${search}`);
    }
  }, [activeBoardId, inspectedIssueId, bundle.issues]);

  const activeWorkspace = useMemo(
    () =>
      userWorkspaces.find((w) => w.id === activeWorkspaceId) ||
      userWorkspaces[0] ||
      bundle.workspaces[0],
    [userWorkspaces, bundle.workspaces, activeWorkspaceId]
  );

  const workspaceMembers = useMemo(
    () => bundle.members.filter((m) => m.workspaceId === activeWorkspace.id),
    [bundle.members, activeWorkspace.id]
  );

  const currentUserRole: MemberRole = useMemo(() => {
    const record = workspaceMembers.find((m) => m.userId === currentUserId);
    return record?.role || 'owner';
  }, [workspaceMembers, currentUserId]);

  const canEdit = currentUserRole !== 'viewer';
  const isAdminOrOwner =
    currentUserRole === 'owner' || currentUserRole === 'admin';

  // Helper to append activity entry
  const createActivityRecord = useCallback(
    (
      action: string,
      detail: string,
      boardId?: string,
      issueId?: string,
      issueIdentifier?: string
    ): ActivityRecord => ({
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      workspaceId: activeWorkspace.id,
      boardId,
      issueId,
      issueIdentifier,
      actorId: currentUserId,
      actorName: currentUserName,
      actorInitials: currentUserInitials,
      actorColor: currentUserColor,
      action,
      detail,
      createdAt: 'Just now',
    }),
    [
      activeWorkspace.id,
      currentUserId,
      currentUserName,
      currentUserInitials,
      currentUserColor,
    ]
  );

  const selectWorkspace = (workspaceId: string) => {
    setActiveWorkspaceId(workspaceId);
    const firstBoard = bundle.boards.find(
      (b) => b.workspaceId === workspaceId && !b.archived
    );
    if (firstBoard) {
      setActiveBoardId(firstBoard.id);
    }
    setInspectedIssueId(null);
  };

  const createWorkspace = (name: string) => {
    const clean = name.trim().slice(0, 80);
    if (!clean) return;
    const newWsId = `ws-${Date.now().toString(36)}`;
    const slug = clean.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newTeamId = `tm-${Date.now().toString(36)}`;
    const newBoardId = `brd-${Date.now().toString(36)}`;

    persistAndBroadcast((prev) => {
      const newWs: WorkspaceRecord = {
        id: newWsId,
        name: clean,
        slug,
        ownerId: currentUserId,
        createdAt: new Date().toISOString(),
      };
      const newMember: WorkspaceMemberRecord = {
        workspaceId: newWsId,
        userId: currentUserId,
        role: 'owner',
        displayName: currentUserName,
        initials: currentUserInitials,
        color: currentUserColor,
        title: profile?.title || 'Workspace Owner',
        joinedAt: new Date().toISOString(),
      };
      const newTeam: TeamRecord = {
        id: newTeamId,
        workspaceId: newWsId,
        key: clean.slice(0, 3).toUpperCase(),
        name: 'General Engineering',
        color: '#5E6AD2',
        issueCounter: 1,
        createdAt: new Date().toISOString(),
      };
      const newBoard: BoardRecord = {
        id: newBoardId,
        workspaceId: newWsId,
        teamId: newTeamId,
        teamKey: newTeam.key,
        title: `${clean} Roadmap`,
        description: 'Primary Kanban workflow board for this workspace.',
        template: 'kanban',
        archived: false,
        createdBy: currentUserId,
        createdAt: new Date().toISOString(),
        updatedAt: 'Just now',
      };
      const newLists: BoardListRecord[] = TEMPLATE_LISTS.kanban.map(
        (tpl, idx) => ({
          id: `lst-${newBoardId}-${idx + 1}`,
          workspaceId: newWsId,
          boardId: newBoardId,
          title: tpl.title,
          color: tpl.color,
          position: (idx + 1) * 1000,
          isDoneList: tpl.isDoneList,
        })
      );
      const firstIssue: IssueRecord = {
        id: `iss-${Date.now().toString(36)}`,
        workspaceId: newWsId,
        teamId: newTeamId,
        boardId: newBoardId,
        listId: newLists[1].id,
        number: 1,
        identifier: `${newTeam.key}-1`,
        title: `Set up initial milestones for ${clean}`,
        description: 'Invite team members and configure workflow columns.',
        priority: 'medium',
        assigneeId: currentUserId,
        estimate: 3,
        dueDate: null,
        position: 1000,
        labelIds: [],
        createdBy: currentUserId,
        createdAt: 'Just now',
        updatedAt: 'Just now',
      };

      return {
        ...prev,
        workspaces: [...prev.workspaces, newWs],
        members: [...prev.members, newMember],
        teams: [...prev.teams, newTeam],
        boards: [...prev.boards, newBoard],
        lists: [...prev.lists, ...newLists],
        issues: [...prev.issues, firstIssue],
      };
    });

    setActiveWorkspaceId(newWsId);
  };

  const setMySimRole = (role: MemberRole) => {
    persistAndBroadcast((prev) => ({
      ...prev,
      members: prev.members.map((m) =>
        m.workspaceId === activeWorkspace.id && m.userId === currentUserId
          ? { ...m, role }
          : m
      ),
    }));
  };

  const updateMemberRole = (userId: string, role: MemberRole) => {
    if (!isAdminOrOwner) return;
    persistAndBroadcast((prev) => ({
      ...prev,
      members: prev.members.map((m) =>
        m.workspaceId === activeWorkspace.id && m.userId === userId
          ? { ...m, role }
          : m
      ),
    }));
  };

  const createTeam = (name: string, key: string, color: string) => {
    if (!canEdit) return;
    const cleanKey = key
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 6);
    const cleanName = name.trim().slice(0, 80);
    if (!cleanKey || !cleanName) return;

    const newTeam: TeamRecord = {
      id: `tm-${Date.now().toString(36)}`,
      workspaceId: activeWorkspace.id,
      key: cleanKey,
      name: cleanName,
      color,
      issueCounter: 0,
      createdAt: new Date().toISOString(),
    };

    persistAndBroadcast((prev) => ({
      ...prev,
      teams: [...prev.teams, newTeam],
      activity: [
        createActivityRecord(
          'created team',
          `${cleanKey} · ${cleanName}`
        ),
        ...prev.activity,
      ],
    }));
  };

  const createInvite = (role: MemberRole): InviteRecord => {
    const token = `tb_inv_${Math.random().toString(36).slice(2, 10)}${Date.now()
      .toString(36)
      .slice(-4)}`;
    const invite: InviteRecord = {
      id: `inv-${Date.now().toString(36)}`,
      workspaceId: activeWorkspace.id,
      workspaceName: activeWorkspace.name,
      token,
      role,
      createdBy: currentUserId,
      createdAt: 'Just now',
    };
    persistAndBroadcast((prev) => ({
      ...prev,
      invites: [invite, ...prev.invites],
      activity: [
        createActivityRecord(
          'created invite link',
          `Role: ${role.toUpperCase()} (${token.slice(0, 12)}...)`
        ),
        ...prev.activity,
      ],
    }));
    return invite;
  };

  const acceptInviteToken = (
    tokenInput: string
  ): { success: boolean; message: string } => {
    const clean = tokenInput.trim();
    // Extract token if user pasted full URL `?invite=tb_inv_...`
    const extracted = clean.includes('invite=')
      ? clean.split('invite=')[1].split('&')[0]
      : clean;

    const found = bundle.invites.find((i) => i.token === extracted);
    if (!found) {
      return {
        success: false,
        message: 'Invalid or expired invite token. Please check the token string.',
      };
    }

    persistAndBroadcast((prev) => {
      const existingMember = prev.members.find(
        (m) => m.workspaceId === found.workspaceId && m.userId === currentUserId
      );
      const updatedMembers = existingMember
        ? prev.members.map((m) =>
            m.workspaceId === found.workspaceId && m.userId === currentUserId
              ? { ...m, role: found.role }
              : m
          )
        : [
            ...prev.members,
            {
              workspaceId: found.workspaceId,
              userId: currentUserId,
              role: found.role,
              displayName: currentUserName,
              initials: currentUserInitials,
              color: currentUserColor,
              joinedAt: new Date().toISOString(),
            },
          ];

      return {
        ...prev,
        members: updatedMembers,
        invites: prev.invites.map((i) =>
          i.id === found.id ? { ...i, acceptedBy: currentUserId } : i
        ),
        activity: [
          createActivityRecord(
            'accepted workspace invite',
            `Joined ${found.workspaceName} with role ${found.role.toUpperCase()}`
          ),
          ...prev.activity,
        ],
      };
    });

    setActiveWorkspaceId(found.workspaceId);
    return {
      success: true,
      message: `Joined ${found.workspaceName} as ${found.role.toUpperCase()}!`,
    };
  };

  const createBoard = (payload: {
    teamId: string;
    title: string;
    description: string;
    template: BoardTemplate;
  }): BoardRecord => {
    const team =
      bundle.teams.find((t) => t.id === payload.teamId) || bundle.teams[0];
    const newBoardId = `brd-${Date.now().toString(36)}`;
    const newBoard: BoardRecord = {
      id: newBoardId,
      workspaceId: activeWorkspace.id,
      teamId: team.id,
      teamKey: team.key,
      title: payload.title.trim().slice(0, 120),
      description:
        payload.description.trim().slice(0, 500) ||
        `${payload.template.replace('_', ' ')} workflow board for ${team.name}.`,
      template: payload.template,
      archived: false,
      createdBy: currentUserId,
      createdAt: new Date().toISOString(),
      updatedAt: 'Just now',
    };

    const templateColumns = TEMPLATE_LISTS[payload.template];
    const createdLists: BoardListRecord[] = templateColumns.map((col, idx) => ({
      id: `lst-${newBoardId}-${idx + 1}`,
      workspaceId: activeWorkspace.id,
      boardId: newBoardId,
      title: col.title,
      color: col.color,
      position: (idx + 1) * 1000,
      isDoneList: col.isDoneList,
    }));

    persistAndBroadcast((prev) => ({
      ...prev,
      boards: [newBoard, ...prev.boards],
      lists: [...prev.lists, ...createdLists],
      activity: [
        createActivityRecord(
          'created board',
          `${team.key} · ${newBoard.title} (${payload.template} template)`,
          newBoardId
        ),
        ...prev.activity,
      ],
    }));

    setActiveBoardId(newBoardId);
    return newBoard;
  };

  const toggleArchiveBoard = (boardId: string) => {
    if (!canEdit) return;
    const target = bundle.boards.find((b) => b.id === boardId);
    if (!target) return;
    const nextArchived = !target.archived;

    persistAndBroadcast((prev) => ({
      ...prev,
      boards: prev.boards.map((b) =>
        b.id === boardId
          ? { ...b, archived: nextArchived, updatedAt: 'Just now' }
          : b
      ),
      activity: [
        createActivityRecord(
          nextArchived ? 'archived board' : 'restored board',
          `${target.teamKey} · ${target.title}`,
          boardId
        ),
        ...prev.activity,
      ],
    }));
  };

  const togglePinBoard = (boardId: string) => {
    persistAndBroadcast((prev) => {
      const existing = prev.pins.find(
        (p) =>
          p.workspaceId === activeWorkspace.id &&
          p.userId === currentUserId &&
          p.boardId === boardId
      );
      if (existing) {
        return {
          ...prev,
          pins: prev.pins.filter((p) => p.id !== existing.id),
        };
      }
      const newPin: PinRecord = {
        id: `pin-${Date.now().toString(36)}`,
        workspaceId: activeWorkspace.id,
        userId: currentUserId,
        boardId,
        createdAt: new Date().toISOString(),
      };
      return {
        ...prev,
        pins: [...prev.pins, newPin],
      };
    });
  };

  const createList = (boardId: string, title: string, color = '#5E6AD2') => {
    if (!canEdit || !title.trim()) return;
    const boardLists = bundle.lists
      .filter((l) => l.boardId === boardId)
      .sort((a, b) => a.position - b.position);

    // Insert before Done list or at the end
    const maxPos =
      boardLists.length > 0
        ? boardLists[boardLists.length - 1].position + 1000
        : 1000;

    const newList: BoardListRecord = {
      id: `lst-${Date.now().toString(36)}`,
      workspaceId: activeWorkspace.id,
      boardId,
      title: title.trim().slice(0, 60),
      color,
      position: maxPos,
      isDoneList: false,
    };

    persistAndBroadcast((prev) => ({
      ...prev,
      lists: [...prev.lists, newList],
    }));
  };

  const renameList = (listId: string, title: string) => {
    if (!canEdit || !title.trim()) return;
    persistAndBroadcast((prev) => ({
      ...prev,
      lists: prev.lists.map((l) =>
        l.id === listId ? { ...l, title: title.trim().slice(0, 60) } : l
      ),
    }));
  };

  const deleteList = (listId: string) => {
    if (!canEdit) return;
    persistAndBroadcast((prev) => ({
      ...prev,
      lists: prev.lists.filter((l) => l.id !== listId),
    }));
  };

  const createIssue = (payload: {
    boardId: string;
    listId?: string;
    title: string;
    description: string;
    priority: IssuePriority;
    assigneeId: string | null;
    estimate: number;
    dueDate: string | null;
    labelIds: string[];
  }): IssueRecord | null => {
    if (!canEdit || !payload.title.trim()) return null;

    const board =
      bundle.boards.find((b) => b.id === payload.boardId) || bundle.boards[0];
    const team =
      bundle.teams.find((t) => t.id === board.teamId) || bundle.teams[0];
    const boardLists = bundle.lists
      .filter((l) => l.boardId === board.id)
      .sort((a, b) => a.position - b.position);
    const targetListId = payload.listId || boardLists[0]?.id || 'lst-eng-1';

    const listIssues = bundle.issues
      .filter((i) => i.listId === targetListId)
      .sort((a, b) => a.position - b.position);
    const nextPosition =
      listIssues.length > 0
        ? listIssues[listIssues.length - 1].position + 1000
        : 1000;

    // Safe atomic per-team counter increment
    const nextNum = team.issueCounter + 1;
    const identifier = `${team.key}-${nextNum}`;

    const newIssue: IssueRecord = {
      id: `iss-${Date.now().toString(36)}`,
      workspaceId: activeWorkspace.id,
      teamId: team.id,
      boardId: board.id,
      listId: targetListId,
      number: nextNum,
      identifier,
      title: payload.title.trim().slice(0, 200),
      description: payload.description.trim().slice(0, 5000),
      priority: payload.priority,
      assigneeId: payload.assigneeId,
      estimate: payload.estimate,
      dueDate: payload.dueDate,
      position: nextPosition,
      labelIds: payload.labelIds,
      createdBy: currentUserId,
      createdAt: 'Just now',
      updatedAt: 'Just now',
    };

    persistAndBroadcast((prev) => {
      const nextNotifications = [...prev.notifications];
      if (payload.assigneeId) {
        nextNotifications.unshift({
          id: `notif-${Date.now().toString(36)}`,
          workspaceId: activeWorkspace.id,
          recipientId: payload.assigneeId,
          actorName: currentUserName,
          type: 'assigned',
          issueId: newIssue.id,
          issueIdentifier: identifier,
          boardId: board.id,
          title: `${currentUserName} assigned ${identifier} (${newIssue.title}) to you`,
          read: false,
          createdAt: 'Just now',
        });
      }

      return {
        ...prev,
        teams: prev.teams.map((t) =>
          t.id === team.id ? { ...t, issueCounter: nextNum } : t
        ),
        boards: prev.boards.map((b) =>
          b.id === board.id ? { ...b, updatedAt: 'Just now' } : b
        ),
        issues: [newIssue, ...prev.issues],
        notifications: nextNotifications,
        activity: [
          createActivityRecord(
            'created issue',
            `${identifier} · ${newIssue.title}`,
            board.id,
            newIssue.id,
            identifier
          ),
          ...prev.activity,
        ],
      };
    });

    return newIssue;
  };

  const updateIssue = (
    issueId: string,
    updates: Partial<
      Pick<
        IssueRecord,
        | 'title'
        | 'description'
        | 'listId'
        | 'priority'
        | 'assigneeId'
        | 'estimate'
        | 'dueDate'
        | 'position'
        | 'labelIds'
      >
    >,
    logAction?: { action: string; detail: string }
  ) => {
    if (!canEdit) return;
    const existing = bundle.issues.find((i) => i.id === issueId);
    if (!existing) return;

    persistAndBroadcast((prev) => {
      const nextNotifications = [...prev.notifications];
      if (
        updates.assigneeId !== undefined &&
        updates.assigneeId !== existing.assigneeId &&
        updates.assigneeId !== null
      ) {
        nextNotifications.unshift({
          id: `notif-${Date.now().toString(36)}`,
          workspaceId: activeWorkspace.id,
          recipientId: updates.assigneeId,
          actorName: currentUserName,
          type: 'assigned',
          issueId: existing.id,
          issueIdentifier: existing.identifier,
          boardId: existing.boardId,
          title: `${currentUserName} assigned ${existing.identifier} to you`,
          read: false,
          createdAt: 'Just now',
        });
      }

      const nextActivity = [...prev.activity];
      if (logAction) {
        nextActivity.unshift(
          createActivityRecord(
            logAction.action,
            `${existing.identifier} · ${logAction.detail}`,
            existing.boardId,
            existing.id,
            existing.identifier
          )
        );
      }

      return {
        ...prev,
        issues: prev.issues.map((i) =>
          i.id === issueId
            ? { ...i, ...updates, updatedAt: 'Just now' }
            : i
        ),
        boards: prev.boards.map((b) =>
          b.id === existing.boardId ? { ...b, updatedAt: 'Just now' } : b
        ),
        notifications: nextNotifications,
        activity: nextActivity,
      };
    });
  };

  // Single-row fractional position update with optimistic rollback support
  const moveIssueOptimistic = (
    issueId: string,
    targetListId: string,
    newPosition: number
  ) => {
    if (!canEdit) return;
    const issue = bundle.issues.find((i) => i.id === issueId);
    const targetList = bundle.lists.find((l) => l.id === targetListId);
    const sourceList = bundle.lists.find((l) => l.id === issue?.listId);
    if (!issue || !targetList) return;

    const snapshotBeforeMove = bundle.issues;

    try {
      const movedAcrossLists = issue.listId !== targetListId;
      updateIssue(
        issueId,
        { listId: targetListId, position: newPosition },
        movedAcrossLists
          ? {
              action: 'moved issue',
              detail: `from ${sourceList?.title || 'column'} to ${targetList.title}`,
            }
          : {
              action: 'reordered issue',
              detail: `in ${targetList.title} (pos ${Math.round(newPosition)})`,
            }
      );
    } catch {
      // Rollback on error
      persistAndBroadcast((prev) => ({
        ...prev,
        issues: snapshotBeforeMove,
      }));
    }
  };

  const deleteIssue = (issueId: string) => {
    if (!canEdit) return;
    const target = bundle.issues.find((i) => i.id === issueId);
    if (!target) return;
    if (inspectedIssueId === issueId) {
      setInspectedIssueId(null);
    }
    persistAndBroadcast((prev) => ({
      ...prev,
      issues: prev.issues.filter((i) => i.id !== issueId),
      comments: prev.comments.filter((c) => c.issueId !== issueId),
      activity: [
        createActivityRecord(
          'deleted issue',
          `${target.identifier} · ${target.title}`,
          target.boardId
        ),
        ...prev.activity,
      ],
    }));
  };

  const createLabel = (name: string, color: string): LabelRecord => {
    const newLabel: LabelRecord = {
      id: `lbl-${Date.now().toString(36)}`,
      workspaceId: activeWorkspace.id,
      name: name.trim().slice(0, 40),
      color,
    };
    persistAndBroadcast((prev) => ({
      ...prev,
      labels: [...prev.labels, newLabel],
    }));
    return newLabel;
  };

  const addComment = (issueId: string, body: string) => {
    if (!canEdit || !body.trim()) return;
    const issue = bundle.issues.find((i) => i.id === issueId);
    if (!issue) return;

    const newComment: CommentRecord = {
      id: `cmt-${Date.now().toString(36)}`,
      workspaceId: activeWorkspace.id,
      issueId,
      authorId: currentUserId,
      authorName: currentUserName,
      authorInitials: currentUserInitials,
      authorColor: currentUserColor,
      body: body.trim().slice(0, 2000),
      createdAt: 'Just now',
      updatedAt: 'Just now',
    };

    persistAndBroadcast((prev) => {
      const nextNotifications = [...prev.notifications];
      const recipient = issue.assigneeId || issue.createdBy;
      if (recipient) {
        nextNotifications.unshift({
          id: `notif-${Date.now().toString(36)}`,
          workspaceId: activeWorkspace.id,
          recipientId: recipient,
          actorName: currentUserName,
          type: 'commented',
          issueId: issue.id,
          issueIdentifier: issue.identifier,
          boardId: issue.boardId,
          title: `${currentUserName} commented on ${issue.identifier}: "${newComment.body.slice(
            0,
            60
          )}"`,
          read: false,
          createdAt: 'Just now',
        });
      }

      return {
        ...prev,
        comments: [...prev.comments, newComment],
        notifications: nextNotifications,
        activity: [
          createActivityRecord(
            'commented on',
            `${issue.identifier} · "${newComment.body.slice(0, 70)}"`,
            issue.boardId,
            issue.id,
            issue.identifier
          ),
          ...prev.activity,
        ],
      };
    });
  };

  const updateComment = (commentId: string, body: string) => {
    if (!canEdit || !body.trim()) return;
    persistAndBroadcast((prev) => ({
      ...prev,
      comments: prev.comments.map((c) =>
        c.id === commentId && c.authorId === currentUserId
          ? { ...c, body: body.trim().slice(0, 2000), updatedAt: 'Edited just now' }
          : c
      ),
    }));
  };

  const deleteComment = (commentId: string) => {
    if (!canEdit) return;
    persistAndBroadcast((prev) => ({
      ...prev,
      comments: prev.comments.filter(
        (c) => !(c.id === commentId && c.authorId === currentUserId)
      ),
    }));
  };

  const markNotificationRead = (notificationId: string) => {
    persistAndBroadcast((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      ),
    }));
  };

  const markAllNotificationsRead = () => {
    persistAndBroadcast((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
  };

  const openIssueByIdentifier = useCallback(
    (identifier: string) => {
      const found = bundle.issues.find(
        (i) => i.identifier.toLowerCase() === identifier.toLowerCase()
      );
      if (found) {
        setActiveBoardId(found.boardId);
        setInspectedIssueId(found.id);
      }
    },
    [bundle.issues]
  );

  // Filtered by activeWorkspace
  const wsTeams = useMemo(
    () => bundle.teams.filter((t) => t.workspaceId === activeWorkspace.id),
    [bundle.teams, activeWorkspace.id]
  );
  const wsBoards = useMemo(
    () => bundle.boards.filter((b) => b.workspaceId === activeWorkspace.id),
    [bundle.boards, activeWorkspace.id]
  );
  const wsLists = useMemo(
    () => bundle.lists.filter((l) => l.workspaceId === activeWorkspace.id),
    [bundle.lists, activeWorkspace.id]
  );
  const wsLabels = useMemo(
    () => bundle.labels.filter((l) => l.workspaceId === activeWorkspace.id),
    [bundle.labels, activeWorkspace.id]
  );
  const wsIssues = useMemo(
    () => bundle.issues.filter((i) => i.workspaceId === activeWorkspace.id),
    [bundle.issues, activeWorkspace.id]
  );
  const wsComments = useMemo(
    () => bundle.comments.filter((c) => c.workspaceId === activeWorkspace.id),
    [bundle.comments, activeWorkspace.id]
  );
  const wsActivity = useMemo(
    () => bundle.activity.filter((a) => a.workspaceId === activeWorkspace.id),
    [bundle.activity, activeWorkspace.id]
  );
  const wsInvites = useMemo(
    () => bundle.invites.filter((i) => i.workspaceId === activeWorkspace.id),
    [bundle.invites, activeWorkspace.id]
  );
  const wsNotifications = useMemo(
    () =>
      bundle.notifications.filter(
        (n) =>
          n.workspaceId === activeWorkspace.id &&
          n.recipientId === currentUserId
      ),
    [bundle.notifications, activeWorkspace.id, currentUserId]
  );
  const wsPins = useMemo(
    () =>
      bundle.pins.filter(
        (p) =>
          p.workspaceId === activeWorkspace.id && p.userId === currentUserId
      ),
    [bundle.pins, activeWorkspace.id, currentUserId]
  );
  const wsPresence = useMemo(
    () => bundle.presence.filter((p) => p.workspaceId === activeWorkspace.id),
    [bundle.presence, activeWorkspace.id]
  );

  return (
    <TeamBoardsContext.Provider
      value={{
        workspaces: userWorkspaces,
        activeWorkspace,
        members: workspaceMembers,
        currentUserRole,
        canEdit,
        isAdminOrOwner,
        teams: wsTeams,
        boards: wsBoards,
        lists: wsLists,
        labels: wsLabels,
        issues: wsIssues,
        comments: wsComments,
        activity: wsActivity,
        invites: wsInvites,
        notifications: wsNotifications,
        pins: wsPins,
        presence: wsPresence,
        isOnline,
        activeBoardId,
        setActiveBoardId,
        inspectedIssueId,
        setInspectedIssueId,
        openIssueByIdentifier,
        selectWorkspace,
        createWorkspace,
        setMySimRole,
        updateMemberRole,
        createTeam,
        createInvite,
        acceptInviteToken,
        createBoard,
        toggleArchiveBoard,
        togglePinBoard,
        createList,
        renameList,
        deleteList,
        createIssue,
        updateIssue,
        moveIssueOptimistic,
        deleteIssue,
        createLabel,
        addComment,
        updateComment,
        deleteComment,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </TeamBoardsContext.Provider>
  );
};

export function useTeamBoards() {
  const ctx = useContext(TeamBoardsContext);
  if (!ctx) {
    throw new Error('useTeamBoards must be used within TeamBoardsProvider');
  }
  return ctx;
}
