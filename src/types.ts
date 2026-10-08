export type IssueStatus = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done' | 'blocked';

export type IssuePriority = 'urgent' | 'high' | 'medium' | 'low' | 'none';

export interface TeamMember {
  id: string;
  name: string;
  handle: string;
  role: string;
  initials: string;
  color: string;
  capacityPts: number;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface ActivityEvent {
  id: string;
  authorId: string;
  type: 'comment' | 'status_change' | 'commit' | 'priority_change';
  content: string;
  timestamp: string;
  meta?: string;
}

export interface Issue {
  id: string; // e.g., "SLT-142"
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  assigneeId: string | null;
  projectId: string;
  cycleId: string;
  estimate: number; // Fibonacci points: 1, 2, 3, 5, 8
  labels: string[];
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  prNumber?: string;
  branchName?: string;
  subtasks: SubTask[];
  activity: ActivityEvent[];
}

export interface Project {
  id: string;
  name: string;
  key: string;
  leadId: string;
  status: 'On Track' | 'At Risk' | 'Completed';
  targetDate: string;
  description: string;
  progress: number;
}

export interface Cycle {
  id: string;
  number: number;
  name: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Upcoming' | 'Completed';
  scopePoints: number;
  completedPoints: number;
  dailyBurnup: {
    day: string;
    scope: number;
    completed: number;
    ideal: number;
  }[];
}

export type ActiveScreen = 'board' | 'list' | 'cycles' | 'triage' | 'roadmap';
