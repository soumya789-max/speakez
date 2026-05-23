import Link from "next/link";
import {
  Mic,
  TrendingUp,
  Calendar,
  Target,
  Flame,
  Clock,
  ChevronRight,
  Briefcase,
  Presentation,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getProgress, listSessions } from "../lib/api";
import type { SessionListItem } from "../lib/api";

const SCENARIO_CONFIG: Record<
  string,
  { label: string; icon: typeof Briefcase; color: string }
> = {
  INTERVIEW: { label: "Interview", icon: Briefcase, color: "text-primary" },
  PITCH: { label: "Pitch", icon: Presentation, color: "text-chart-4" },
  MEETING: { label: "Meeting", icon: Users, color: "text-success" },
};

function Sparkline({
  values,
  color = "var(--primary)",
}: {
  values: number[];
  color?: string;
}) {
  if (values.length < 2) return null;
  const w = 160,
    h = 40;
  const max = Math.max(...values, 0.01);
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - (v / max) * (h - 6) - 3;
    return `${x},${y}`;
  });
  const lineD = `M${pts.join("L")}`;
  const gradientId = `gradient-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="block">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${lineD}L${w},${h}L0,${h}Z`} fill={`url(#${gradientId})`} />
      <path
        d={lineD}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function computeStreak(sessions: SessionListItem[]): number {
  if (!sessions.length) return 0;
  const days = new Set(
    sessions.map((s) => new Date(s.createdAt).toISOString().slice(0, 10))
  );
  const sorted = Array.from(days).sort().reverse();
  let streak = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  for (const day of sorted) {
    const d = new Date(day);
    const diff = Math.round((cursor.getTime() - d.getTime()) / 86400000);
    if (diff > 1) break;
    streak++;
    cursor = d;
  }
  return streak;
}

export default async function DashboardPage() {
  const [{ sessions }, progress] = await Promise.all([
    listSessions().catch(() => ({ sessions: [] as SessionListItem[] })),
    getProgress().catch(() => null),
  ]);

  const streak = computeStreak(sessions);
  const lastSession = sessions[0] ?? null;
  const trendValues = (progress?.confidenceTrend ?? [])
    .filter((t) => t.confidence != null)
    .slice(-12)
    .map((t) => t.confidence as number);
  const topIssue = progress?.repeatedIssues?.[0] ?? null;

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Welcome back
          </h1>
          <p className="text-muted-foreground mt-1">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <Button asChild size="lg" className="gap-2">
          <Link href="/session">
            <Mic className="h-4 w-4" />
            Start Practice
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-3">
            <Flame className="h-4 w-4 text-warning" />
            <span className="text-xs font-semibold uppercase tracking-wide">
              Streak
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{streak}</span>
            <span className="text-muted-foreground text-sm">days</span>
          </div>
          <div className="mt-3">
            <div className="progress-track">
              <div
                className="progress-fill bg-warning"
                style={{ width: `${Math.min((streak / 7) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {streak >= 7
                ? "Week complete!"
                : `${7 - streak} days to weekly goal`}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-3">
            <Calendar className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">
              Sessions
            </span>
          </div>
          <div className="text-3xl font-bold">
            {progress?.totalSessions ?? sessions.length}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {progress?.analyzedSessions ?? 0} analyzed
          </p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-3">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wide">
              Confidence
            </span>
          </div>
          <div className="text-3xl font-bold text-primary">
            {progress?.avgConfidence != null
              ? `${Math.round(progress.avgConfidence * 100)}%`
              : "—"}
          </div>
          <p className="text-xs text-muted-foreground mt-2">average score</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-3">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">
              Last Session
            </span>
          </div>
          {lastSession ? (
            <>
              <div className="font-semibold truncate">
                {lastSession.title ||
                  SCENARIO_CONFIG[lastSession.scenario]?.label}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {new Date(lastSession.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </>
          ) : (
            <div className="text-muted-foreground">No sessions yet</div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">Confidence Trend</h2>
            <span className="text-xs text-muted-foreground">
              Last {trendValues.length} sessions
            </span>
          </div>
          {trendValues.length >= 2 ? (
            <>
              <Sparkline values={trendValues} />
              <div className="flex justify-between mt-3 text-xs text-muted-foreground">
                <span>{Math.round((trendValues[0] ?? 0) * 100)}% start</span>
                <span>
                  {Math.round(
                    (trendValues[trendValues.length - 1] ?? 0) * 100
                  )}
                  % latest
                </span>
              </div>
            </>
          ) : (
            <div className="h-12 flex items-center">
              <span className="text-sm text-muted-foreground">
                Complete 2+ sessions to see your trend
              </span>
            </div>
          )}
        </div>

        <div className="card-glow p-6">
          <h2 className="text-base font-semibold mb-4">Current Focus Area</h2>
          {topIssue ? (
            <>
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-primary flex-shrink-0" />
                <div>
                  <div className="font-semibold text-primary">
                    {topIssue.issue}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Flagged {topIssue.count} time
                    {topIssue.count !== 1 ? "s" : ""} across sessions
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="mt-4" asChild>
                <Link href="/roadmap">
                  View roadmap
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </>
          ) : (
            <p className="text-muted-foreground text-sm">
              Complete 2+ analyzed sessions to get your focus area.
            </p>
          )}
        </div>
      </div>

      {progress && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card-elevated p-6">
            <h2 className="text-base font-semibold mb-5">Skill Progression</h2>
            <div className="space-y-5">
              {[
                { label: "Clarity", color: "var(--chart-2)", key: "clarity" },
                {
                  label: "Structure",
                  color: "var(--chart-4)",
                  key: "structure",
                },
                {
                  label: "Relevance",
                  color: "var(--chart-5)",
                  key: "relevance",
                },
                {
                  label: "Speech Delivery",
                  color: "var(--warning)",
                  key: "speechScore",
                },
              ].map((skill) => {
                const vals = (progress.skillTrend || [])
                  .map(
                    (t) => t[skill.key as keyof typeof t] as number | null
                  )
                  .filter((v) => v != null) as number[];
                const latest = vals.length > 0 ? vals[vals.length - 1]! : null;

                return (
                  <div key={skill.key}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-muted-foreground">
                        {skill.label}
                      </span>
                      <span
                        className="text-sm font-bold"
                        style={{ color: latest ? skill.color : undefined }}
                      >
                        {latest ? `${Math.round(latest * 100)}%` : "—"}
                      </span>
                    </div>
                    {vals.length >= 2 ? (
                      <Sparkline
                        values={vals.slice(-10)}
                        color={skill.color}
                      />
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Need 2+ sessions
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card-elevated p-6">
            <h2 className="text-base font-semibold mb-5">Scenario Breakdown</h2>
            <div className="space-y-4">
              {progress.byScenario.map((item) => {
                const config = SCENARIO_CONFIG[item.scenario];
                const Icon = config?.icon ?? Briefcase;
                const pct =
                  item.avgConfidence != null
                    ? Math.round(item.avgConfidence * 100)
                    : 0;

                return (
                  <div key={item.scenario}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`h-4 w-4 ${config?.color ?? "text-primary"}`}
                        />
                        <span className="text-sm font-medium">
                          {config?.label ?? item.scenario}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {item.sessions} session
                          {item.sessions !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <span className="text-sm font-semibold">{pct}%</span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill bg-primary"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="card-elevated p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold">Recent Sessions</h2>
          <Link
            href="/history"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            View all
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <Mic className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">
              No sessions yet. Start your first practice!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.slice(0, 5).map((s) => {
              const config = SCENARIO_CONFIG[s.scenario];
              const Icon = config?.icon ?? Briefcase;

              return (
                <Link
                  key={s.id}
                  href={`/insights?sessionId=${encodeURIComponent(s.id)}`}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-secondary/50 transition-all group no-underline"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="badge badge-primary">
                      <Icon className="h-3 w-3" />
                      {config?.label}
                    </div>
                    <span className="text-sm font-medium truncate text-foreground">
                      {s.title || `${config?.label} session`}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-muted-foreground">
                      {new Date(s.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span
                      className={`badge ${
                        s.status === "READY"
                          ? "badge-success"
                          : s.status === "FAILED"
                            ? "badge-destructive"
                            : "badge-muted"
                      }`}
                    >
                      {s.status}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
