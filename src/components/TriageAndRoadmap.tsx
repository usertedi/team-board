import React from 'react';
import {
  Check,
  ArrowRight,
  Trash2,
  Compass,
  Inbox,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import { Issue, IssueStatus, Project } from '../types';
import { TEAM_MEMBERS, PROJECTS } from '../data';
import { PriorityGlyph, MemberAvatar, StatusChip, Kbd } from './Primitives';

interface TriageViewProps {
  issues: Issue[];
  onAcceptTriage: (issueId: string, targetStatus: IssueStatus) => void;
  onDeleteIssue: (issueId: string) => void;
  onSelectIssue: (issue: Issue) => void;
  onOpenNewIssue: () => void;
}

export const TriageView: React.FC<TriageViewProps> = ({
  issues,
  onAcceptTriage,
  onDeleteIssue,
  onSelectIssue,
  onOpenNewIssue,
}) => {
  const triageIssues = issues.filter(
    (i) => i.status === 'backlog' || i.status === 'blocked'
  );

  return (
    <div className="flex-1 overflow-y-auto bg-[#08090A] p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 text-[12px] text-[#908f9e]">
              <Inbox className="w-3.5 h-3.5 text-[#5E6AD2]" />
              <span>INBOUND TRIAGE & BLOCKED ESCALATIONS</span>
            </div>
            <h1 className="type-headline-lg text-[#e3e2e3] font-display mt-0.5">
              Triage Queue ({triageIssues.length})
            </h1>
          </div>

          <button
            onClick={onOpenNewIssue}
            className="h-[28px] px-3 bg-[#5E6AD2] hover:bg-[#4D58BF] text-white rounded-[4px] type-label-md flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Triage Item</span>
          </button>
        </div>

        {triageIssues.length === 0 ? (
          <div className="h-[220px] rounded-[4px] border border-dashed border-white/[0.12] flex flex-col items-center justify-center gap-2 text-center p-6">
            <CheckCircle2 className="w-6 h-6 text-[#27C383]" />
            <div className="type-headline-sm text-[#e3e2e3]">
              Triage Queue Zero
            </div>
            <p className="type-body-sm text-[#6E7681] max-w-md">
              All inbound engineering issues and blocked escalations have been
              routed into active cycles.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {triageIssues.map((issue) => {
              const assignee = TEAM_MEMBERS.find(
                (m) => m.id === issue.assigneeId
              );
              const project = PROJECTS.find((p) => p.id === issue.projectId);

              return (
                <div
                  key={issue.id}
                  onClick={() => onSelectIssue(issue)}
                  className="bg-[#121417] border border-white/[0.06] hover:border-white/[0.14] rounded-[4px] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors cursor-pointer"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-[12px] text-[#908f9e]">
                      <PriorityGlyph priority={issue.priority} size={12} />
                      <span className="font-mono-tabular font-medium text-[#c6c5d5]">
                        {issue.id}
                      </span>
                      <span>·</span>
                      <StatusChip status={issue.status} />
                      {project && (
                        <>
                          <span>·</span>
                          <span className="text-[#6E7681]">{project.name}</span>
                        </>
                      )}
                      <span>·</span>
                      <span className="font-mono-tabular text-[#6E7681]">
                        {issue.estimate} pts
                      </span>
                    </div>

                    <h3 className="type-headline-sm text-[#e3e2e3]">
                      {issue.title}
                    </h3>
                    <p className="type-body-sm text-[#908f9e] line-clamp-2">
                      {issue.description}
                    </p>
                  </div>

                  {/* Direct Triage Action Buttons */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 shrink-0"
                  >
                    {assignee && (
                      <div className="mr-2 flex items-center gap-1.5 text-[11px] text-[#908f9e]">
                        <MemberAvatar
                          initials={assignee.initials}
                          color={assignee.color}
                          name={assignee.name}
                          size="xs"
                        />
                        <span>{assignee.name.split(' ')[0]}</span>
                      </div>
                    )}

                    <button
                      onClick={() => onAcceptTriage(issue.id, 'todo')}
                      className="h-[28px] px-2.5 bg-[#5E6AD2] hover:bg-[#4D58BF] text-white border border-white/10 rounded-[4px] type-label-md flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Accept to Todo</span>
                    </button>

                    <button
                      onClick={() => onAcceptTriage(issue.id, 'in_progress')}
                      className="h-[28px] px-2.5 bg-white/[0.03] hover:bg-white/[0.06] text-[#D0D6E0] hover:text-white border border-white/[0.08] rounded-[4px] type-label-md flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>Start Now</span>
                    </button>

                    <button
                      onClick={() => onDeleteIssue(issue.id)}
                      title="Decline / Archive Issue"
                      className="h-[28px] w-[28px] bg-white/[0.03] hover:bg-[#EB5757]/20 text-[#908f9e] hover:text-[#EB5757] border border-white/[0.08] rounded-[4px] flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

interface RoadmapViewProps {
  projects: Project[];
  issues: Issue[];
  onSelectProjectStream: (projectId: string) => void;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({
  projects,
  issues,
  onSelectProjectStream,
}) => {
  return (
    <div className="flex-1 overflow-y-auto bg-[#08090A] p-6">
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 text-[12px] text-[#908f9e]">
              <Compass className="w-3.5 h-3.5 text-[#5E6AD2]" />
              <span>Q4 ENGINEERING INITIATIVES & ARCHITECTURAL STREAMS</span>
            </div>
            <h1 className="type-headline-lg text-[#e3e2e3] font-display mt-0.5">
              Core Infrastructure Initiatives
            </h1>
          </div>
          <Kbd>G R</Kbd>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {projects.map((proj) => {
            const lead = TEAM_MEMBERS.find((m) => m.id === proj.leadId);
            const projIssues = issues.filter((i) => i.projectId === proj.id);
            const doneCount = projIssues.filter((i) => i.status === 'done').length;

            const statusColor =
              proj.status === 'On Track'
                ? '#27C383'
                : proj.status === 'At Risk'
                ? '#E5A83B'
                : '#8B95E5';

            return (
              <div
                key={proj.id}
                onClick={() => onSelectProjectStream(proj.id)}
                className="bg-[#121417] border border-white/[0.06] hover:border-[#5E6AD2] rounded-[4px] p-4 transition-colors cursor-pointer space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono-tabular text-[11px] px-1.5 py-0.5 rounded-[3px] bg-white/[0.05] border border-white/[0.1] text-[#c6c5d5]">
                      {proj.key}
                    </span>
                    <h3 className="type-headline-md text-[#e3e2e3]">
                      {proj.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 text-[12px] text-[#908f9e] font-mono-tabular">
                    <span
                      style={{ color: statusColor }}
                      className="flex items-center gap-1.5 font-medium"
                    >
                      <span
                        style={{ backgroundColor: statusColor }}
                        className="w-2 h-2 rounded-full inline-block"
                      />
                      {proj.status}
                    </span>
                    <span>·</span>
                    <span>Target: {proj.targetDate}</span>
                    <span>·</span>
                    <span>
                      {doneCount}/{projIssues.length} issues done
                    </span>
                  </div>
                </div>

                <p className="type-body-md text-[#908f9e]">{proj.description}</p>

                <div className="flex items-center justify-between gap-4 pt-2 border-t border-white/[0.04]">
                  <div className="flex items-center gap-2 text-[12px] text-[#908f9e]">
                    {lead && (
                      <>
                        <MemberAvatar
                          initials={lead.initials}
                          color={lead.color}
                          name={lead.name}
                          size="xs"
                        />
                        <span>Lead: {lead.name}</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-3 w-48">
                    <div className="flex-1 h-[6px] bg-[#08090A] rounded-[3px] overflow-hidden">
                      <div
                        style={{ width: `${proj.progress}%` }}
                        className="h-full bg-[#5E6AD2]"
                      />
                    </div>
                    <span className="font-mono-tabular text-[12px] text-[#e3e2e3] w-9 text-right">
                      {proj.progress}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
