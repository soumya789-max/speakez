import Link from "next/link";
import {
  Map,
  Trophy,
  Target,
  TrendingUp,
  CheckCircle2,
  Play,
  ExternalLink,
  Briefcase,
  Presentation,
  Users,
  Flame,
  Zap,
  Globe,
  Award,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getProgress } from "../../lib/api";

export const metadata = { title: "Improvement Roadmap – SpeakEZ" };

const ISSUE_TIPS: Record<string, { tip: string; drill: string; videoUrl?: string }> = {
  "filler words": {
    tip: "Pause intentionally instead of filling silence.",
    drill: "Read a paragraph aloud, pausing at every comma.",
    videoUrl: "https://www.youtube.com/watch?v=kYv_M_hX2i4",
  },
  pace: {
    tip: "Target 130–160 words per minute. Record yourself and count.",
    drill: "Read text at 3 speeds: slow, normal, fast.",
    videoUrl: "https://www.youtube.com/watch?v=eIho2S0ZahI",
  },
  "eye contact": {
    tip: "Look at the camera lens, not your own preview.",
    drill: "Practice 5 seconds on camera, 4 seconds off, repeat.",
    videoUrl: "https://www.youtube.com/watch?v=8jEIqEdA8b4",
  },
  posture: {
    tip: "Shoulders relaxed, chin level, sit 10cm back.",
    drill: "Sit against a wall for 5 minutes before each session.",
    videoUrl: "https://www.youtube.com/watch?v=Ks-_Mh1QhMc",
  },
  structure: {
    tip: "Use STAR (Situation, Task, Action, Result).",
    drill: "Tell a past experience in exactly 90 seconds using STAR.",
    videoUrl: "https://www.youtube.com/watch?v=8PjwO2bCvlQ",
  },
  clarity: {
    tip: "Overarticulate consonants when nervous. Slow your opening.",
    drill: "Read tongue twisters for 2 minutes to warm up.",
    videoUrl: "https://www.youtube.com/watch?v=WPvGqX-TXP0",
  },
  confidence: {
    tip: "Power pose 2 minutes before speaking.",
    drill: "Record a 60-second intro video each morning this week.",
    videoUrl: "https://www.youtube.com/watch?v=Ks-_Mh1QhMc",
  },
};

function getIssueTip(issue: string) {
  const lower = issue.toLowerCase();
  for (const key of Object.keys(ISSUE_TIPS)) {
    if (lower.includes(key)) return { key, ...ISSUE_TIPS[key] };
  }
  return {
    key: issue,
    tip: "Keep practicing to reduce this pattern.",
    drill: "Review your session transcripts for specific examples.",
    videoUrl: undefined,
  };
}

const SCENARIO_CONFIG: Record<
  string,
  { label: string; icon: LucideIcon; color: string }
> = {
  INTERVIEW: { label: "Interview", icon: Briefcase, color: "text-primary" },
  PITCH: { label: "Pitch", icon: Presentation, color: "text-chart-4" },
  MEETING: { label: "Meeting", icon: Users, color: "text-success" },
};

const MILESTONES = [
  { id: "first", label: "First Session", icon: Flame, check: (n: number) => n >= 1 },
  { id: "three", label: "3 Sessions", icon: Target, check: (n: number) => n >= 3 },
  { id: "ten", label: "10 Sessions", icon: Award, check: (n: number) => n >= 10 },
  {
    id: "confidence",
    label: "Avg confidence > 70%",
    icon: Zap,
    check: (_: number, avg: number | null) => (avg ?? 0) >= 0.7,
  },
  {
    id: "allscenario",
    label: "Tried all 3 scenarios",
    icon: Globe,
    check: (_: number, __: number | null, all: boolean) => all,
  },
];

function Sparkline({ values, color = "var(--primary)" }: { values: number[]; color?: string }) {
  if (values.length < 2) return null;
  const w = 100,
    h = 32;
  const max = Math.max(...values, 0.01);
  const pts = values.map(
    (v, i) => `${(i / (values.length - 1)) * w},${h - (v / max) * (h - 4) - 2}`
  );
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="block">
      <path
        d={`M${pts.join("L")}`}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default async function RoadmapPage() {
  const progress = await getProgress().catch(() => null);
  const totalSessions = progress?.totalSessions ?? 0;
  const avgConf = progress?.avgConfidence ?? null;
  const allScenarios = (progress?.byScenario ?? []).every((s) => s.sessions > 0);
  const issues = progress?.repeatedIssues ?? [];
  const trendByScenario = progress?.byScenario ?? [];
  const nextRecommendation =
    [...trendByScenario]
      .filter((s) => s.analyzed > 0)
      .sort((a, b) => (a.avgConfidence ?? 0) - (b.avgConfidence ?? 0))[0] ?? null;

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
          <Map className="h-7 w-7 text-primary" />
          Improvement Roadmap
        </h1>
        <p className="text-muted-foreground mt-2">
          Your personalized path to confident, high-impact communication.
        </p>
      </div>

      <div className="card-elevated p-6">
        <div className="flex items-center gap-2 mb-5">
          <Trophy className="h-5 w-5 text-warning" />
          <h2 className="text-lg font-semibold">Milestones</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {MILESTONES.map((m) => {
            const done = m.check(totalSessions, avgConf, allScenarios);
            const Icon = m.icon;
            return (
              <div
                key={m.id}
                className={`p-4 rounded-lg border text-center transition-all ${
                  done
                    ? "border-primary/30 bg-primary/5"
                    : "border-border bg-card opacity-50"
                }`}
              >
                <Icon
                  className={`h-6 w-6 mx-auto ${done ? "text-primary" : "text-muted-foreground"}`}
                />
                <div
                  className={`text-sm font-medium mt-2 ${done ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {m.label}
                </div>
                {done && (
                  <div className="flex items-center justify-center gap-1 text-xs text-success mt-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Achieved
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="card-elevated p-6">
        <div className="flex items-center gap-2 mb-5">
          <Target className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Ranked Focus Areas</h2>
        </div>
        {issues.length === 0 ? (
          <p className="text-muted-foreground">
            Complete 2+ analyzed sessions to unlock your personalized focus areas.
          </p>
        ) : (
          <div className="space-y-4">
            {issues.map((item, i) => {
              const info = getIssueTip(item.issue);
              return (
                <div
                  key={item.issue}
                  className={`p-5 rounded-lg border ${
                    i === 0
                      ? "border-primary/30 bg-primary/5"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="mb-3">
                    <span
                      className={`font-semibold ${i === 0 ? "text-primary" : "text-foreground"}`}
                    >
                      {i === 0 && (
                        <span className="text-destructive">Top Priority: </span>
                      )}
                      {item.issue}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                      Seen {item.count} time{item.count !== 1 ? "s" : ""} across
                      sessions
                    </p>
                  </div>
                  <div className="p-4 rounded-md bg-secondary/50 text-sm space-y-2">
                    <p>
                      <strong>Tip:</strong> {info.tip}
                    </p>
                    <p>
                      <strong>Drill:</strong> {info.drill}
                    </p>
                    {info.videoUrl && (
                      <a
                        href={info.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        Watch Tutorial
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="card-elevated p-6">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Scenario Trends</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {trendByScenario.map((item) => {
            const config = SCENARIO_CONFIG[item.scenario];
            const Icon = config?.icon ?? Briefcase;
            const vals = (progress?.confidenceTrend ?? [])
              .filter((t) => t.scenario === item.scenario && t.confidence != null)
              .map((t) => t.confidence as number);

            return (
              <div key={item.scenario} className="p-4 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${config?.color ?? "text-primary"}`} />
                    <span className="font-medium">
                      {config?.label ?? item.scenario}
                    </span>
                  </div>
                  <span className={`font-bold ${config?.color ?? "text-primary"}`}>
                    {item.avgConfidence != null
                      ? `${Math.round(item.avgConfidence * 100)}%`
                      : "—"}
                  </span>
                </div>
                <div className="h-8">
                  {vals.length >= 2 ? (
                    <Sparkline values={vals} />
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Not enough data
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {item.sessions} session{item.sessions !== 1 ? "s" : ""},{" "}
                  {item.analyzed} analyzed
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {nextRecommendation && (
        <div className="card-glow p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              Next Session Recommendation
            </p>
            <h3 className="text-lg font-bold text-primary">
              Practice{" "}
              {SCENARIO_CONFIG[nextRecommendation.scenario]?.label ??
                nextRecommendation.scenario}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Weakest scenario —{" "}
              {nextRecommendation.avgConfidence != null
                ? `avg ${Math.round(nextRecommendation.avgConfidence * 100)}% confidence`
                : "no data yet"}
              .
            </p>
          </div>
          <Button asChild>
            <Link href="/session">
              <Play className="h-4 w-4 mr-2" />
              Start Session
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
