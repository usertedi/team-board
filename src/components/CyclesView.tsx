import React from 'react';
import { Flame, CheckCircle2, AlertCircle, Clock, ArrowUpRight } from 'lucide-react';
import { Issue, Cycle } from '../types';
import { TEAM_MEMBERS } from '../data';
import { StatusChip, PriorityGlyph, MemberAvatar } from './Primitives';

interface CyclesViewProps {
  cycles: Cycle[];
  issues: Issue[];
  onSelectIssue: (issue: Issue) => void;
}

export const CyclesView: React.FC<CyclesViewProps> = ({
  cycles,
  issues,
  onSelectIssue,
}) => {
  const activeCycle = cycles.find((c) => c.status === 'Active') || cycles[0];
  const cycleIssues = issues.filter((i) => i.cycleId === activeCycle.id);

  const totalScopePts = cycleIssues.reduce((s, i) => s + i.estimate, 0);
  const completedPts = cycleIssues
    .filter((i) => i.status === 'done')
    .reduce((s, i) => s + i.estimate, 0);
  const inProgressPts = cycleIssues
    .filter((i) => i.status === 'in_progress' || i.status === 'in_review')
    .reduce((s, i) => s + i.estimate, 0);
  const blockedPts = cycleIssues
    .filter((i) => i.status === 'blocked')
    .reduce((s, i) => s + i.estimate, 0);

  const completionPct =
    totalScopePts > 0 ? Math.round((completedPts / totalScopePts) * 100) : 0;

  return (
    <div className="flex-1 overflow-y-auto bg-[#08090A] p-6 space-y-6">
      {/* Top Cycle Header & Quantitative Metrics */}
      <div className="bg-[#0C0D0E] border border-white/[0.08] rounded-[4px] p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[12px] text-[#908f9e] font-mono-tabular">
              <Flame className="w-3.5 h-3.5 text-[#5E6AD2]" />
              <span>ACTIVE SPRINT CYCLE</span>
              <span>·</span>
              <span>
                {activeCycle.startDate} – {activeCycle.endDate}, 2026
              </span>
              <span>·</span>
              <span className="text-[#27C383]">5 days remaining</span>
            </div>
            <h1 className="type-headline-lg text-[#e3e2e3] font-display">
              {activeCycle.name}
            </h1>
          </div>

          {/* 4-Column Tabular Telemetry Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 bg-[#121417] border border-white/[0.06] rounded-[4px] px-4 py-3">
            <div>
              <div className="text-[11px] text-[#6E7681]">Cycle Progress</div>
              <div className="font-mono-tabular text-[18px] font-semibold text-[#e3e2e3] mt-0.5">
                {completionPct}%
              </div>
            </div>
            <div>
              <div className="text-[11px] text-[#6E7681]">Completed</div>
              <div className="font-mono-tabular text-[18px] font-semibold text-[#27C383] mt-0.5">
                {completedPts}{' '}
                <span className="text-[12px] text-[#6E7681] font-normal">
                  / {totalScopePts} pt
                </span>
              </div>
            </div>
            <div>
              <div className="text-[11px] text-[#6E7681]">In Flight</div>
              <div className="font-mono-tabular text-[18px] font-semibold text-[#E5A83B] mt-0.5">
                {inProgressPts} pt
              </div>
            </div>
            <div>
              <div className="text-[11px] text-[#6E7681]">Blocked Scope</div>
              <div className="font-mono-tabular text-[18px] font-semibold text-[#EB5757] mt-0.5">
                {blockedPts} pt
              </div>
            </div>
          </div>
        </div>

        {/* Burnup Chart + Engineer Workload Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5">
          {/* Left: SVG Burnup Velocity Curve (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between bg-[#121417] border border-white/[0.06] rounded-[4px] p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="type-headline-sm text-[#e3e2e3]">
                  Cycle 42 Burnup & Scope Trajectory
                </h2>
                <p className="text-[12px] text-[#6E7681]">
                  Story points completed vs total committed cycle scope
                </p>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-[#908f9e]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-[#6E7681] inline-block" />
                  <span>Total Scope</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-[#5E6AD2] inline-block" />
                  <span>Completed Pts</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 border-b border-dashed border-[#27C383] inline-block" />
                  <span>Ideal Pace</span>
                </span>
              </div>
            </div>

            {/* Crisp SVG Chart */}
            <div className="h-[180px] w-full pt-2">
              <svg
                viewBox="0 0 560 150"
                className="w-full h-full overflow-visible"
              >
                {/* Horizontal Reference Grid Lines */}
                {[0, 20, 40, 60, 80].map((val, idx) => {
                  const y = 130 - (val / 80) * 110;
                  return (
                    <g key={val}>
                      <line
                        x1="32"
                        y1={y}
                        x2="545"
                        y2={y}
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y={y + 3}
                        fill="#6E7681"
                        fontSize="10"
                        fontFamily="JetBrains Mono, monospace"
                      >
                        {val}pt
                      </text>
                    </g>
                  );
                })}

                {/* Scope Line */}
                <polyline
                  fill="none"
                  stroke="#6E7681"
                  strokeWidth="1.5"
                  points="40,50 120,47 200,42 280,36 360,36 440,36 530,36"
                />

                {/* Ideal Pace Dashed Line */}
                <line
                  x1="40"
                  y1="124"
                  x2="530"
                  y2="36"
                  stroke="#27C383"
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                  opacity="0.65"
                />

                {/* Completed Area Fill */}
                <polygon
                  fill="rgba(94, 106, 210, 0.14)"
                  points="40,130 40,124 120,113 200,98 280,81 360,66 360,130"
                />

                {/* Completed Trajectory Line */}
                <polyline
                  fill="none"
                  stroke="#5E6AD2"
                  strokeWidth="2"
                  points="40,124 120,113 200,98 280,81 360,66"
                />

                {/* Data Nodes */}
                {[
                  { x: 40, y: 124, label: 'Oct 01' },
                  { x: 120, y: 113, label: 'Oct 03' },
                  { x: 200, y: 98, label: 'Oct 05' },
                  { x: 280, y: 81, label: 'Oct 07' },
                  { x: 360, y: 66, label: 'Oct 09' },
                  { x: 440, y: null, label: 'Oct 11' },
                  { x: 530, y: null, label: 'Oct 14' },
                ].map((pt) => (
                  <g key={pt.label}>
                    {pt.y !== null && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="3.5"
                        fill="#121417"
                        stroke="#5E6AD2"
                        strokeWidth="2"
                      />
                    )}
                    <text
                      x={pt.x - 16}
                      y="146"
                      fill="#6E7681"
                      fontSize="10"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {pt.label}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          {/* Right: Team Allocation & Load Balance (5 cols) */}
          <div className="lg:col-span-5 bg-[#121417] border border-white/[0.06] rounded-[4px] p-4 flex flex-col justify-between">
            <div>
              <h2 className="type-headline-sm text-[#e3e2e3] mb-1">
                Engineer Capacity & Allocation
              </h2>
              <p className="text-[12px] text-[#6E7681] mb-4">
                Assigned story points vs sprint capacity ceiling
              </p>

              <div className="space-y-3">
                {TEAM_MEMBERS.map((member) => {
                  const memberIssues = cycleIssues.filter(
                    (i) => i.assigneeId === member.id
                  );
                  const assignedPts = memberIssues.reduce(
                    (s, i) => s + i.estimate,
                    0
                  );
                  const donePts = memberIssues
                    .filter((i) => i.status === 'done')
                    .reduce((s, i) => s + i.estimate, 0);
                  const loadRatio = Math.min(
                    100,
                    Math.round((assignedPts / member.capacityPts) * 100)
                  );

                  return (
                    <div key={member.id} className="space-y-1">
                      <div className="flex items-center justify-between text-[12px]">
                        <div className="flex items-center gap-2">
                          <MemberAvatar
                            initials={member.initials}
                            color={member.color}
                            name={member.name}
                            size="xs"
                          />
                          <span className="text-[#e3e2e3] font-medium">
                            {member.name}
                          </span>
                        </div>
                        <div className="font-mono-tabular text-[11px] text-[#908f9e]">
                          <span className="text-[#27C383]">{donePts}</span> /{' '}
                          <span className="text-[#e3e2e3]">{assignedPts} pt</span>{' '}
                          <span className="text-[#6E7681]">
                            ({loadRatio}% cap)
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-[5px] bg-[#08090A] rounded-[2px] overflow-hidden flex">
                        <div
                          style={{
                            width: `${
                              member.capacityPts > 0
                                ? (donePts / member.capacityPts) * 100
                                : 0
                            }%`,
                          }}
                          className="bg-[#27C383] h-full"
                        />
                        <div
                          style={{
                            width: `${
                              member.capacityPts > 0
                                ? ((assignedPts - donePts) / member.capacityPts) *
                                  100
                                : 0
                            }%`,
                          }}
                          className="bg-[#5E6AD2] h-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-[#908f9e]">
              <span>Unassigned cycle issues: 0</span>
              <span className="font-mono-tabular text-[#27C383]">
                Velocity: +14% vs Cycle 41
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cycle Active Scope Breakdown Table */}
      <div className="bg-[#0C0D0E] border border-white/[0.08] rounded-[4px] overflow-hidden">
        <div className="h-[40px] px-4 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="type-headline-sm text-[#e3e2e3]">
              Cycle 42 Committed Deliverables
            </h3>
            <span className="font-mono-tabular text-[11px] text-[#6E7681]">
              ({cycleIssues.length} issues)
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-[#908f9e] font-mono-tabular">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#27C383]" />
              {cycleIssues.filter((i) => i.status === 'done').length} Done
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#E5A83B]" />
              {
                cycleIssues.filter(
                  (i) => i.status === 'in_progress' || i.status === 'in_review'
                ).length
              }{' '}
              Active
            </span>
            <span className="flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-[#EB5757]" />
              {cycleIssues.filter((i) => i.status === 'blocked').length} Blocked
            </span>
          </div>
        </div>

        <div className="divide-y divide-white/[0.04]">
          {cycleIssues.map((issue) => {
            const assignee = TEAM_MEMBERS.find((m) => m.id === issue.assigneeId);
            return (
              <div
                key={issue.id}
                onClick={() => onSelectIssue(issue)}
                className="h-[40px] px-4 flex items-center justify-between gap-4 bg-[#121417]/60 hover:bg-[#181B1F] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <PriorityGlyph priority={issue.priority} size={12} />
                  <span className="font-mono-tabular text-[12px] text-[#908f9e] w-[58px] shrink-0">
                    {issue.id}
                  </span>
                  <StatusChip status={issue.status} />
                  <span className="type-body-md text-[#e3e2e3] font-medium truncate">
                    {issue.title}
                  </span>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  {issue.branchName && (
                    <span className="hidden md:inline-block font-mono-tabular text-[11px] text-[#6E7681] truncate max-w-[180px]">
                      {issue.branchName}
                    </span>
                  )}
                  <span className="font-mono-tabular text-[12px] text-[#c6c5d5] w-[36px] text-right">
                    {issue.estimate}pt
                  </span>
                  {assignee && (
                    <MemberAvatar
                      initials={assignee.initials}
                      color={assignee.color}
                      name={assignee.name}
                      size="xs"
                    />
                  )}
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#6E7681]" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
