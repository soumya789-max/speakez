"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSession } from "../../lib/api";
import {
  BarChart3,
  CheckCircle2,
  Star,
  Target,
  AlertTriangle,
  Lightbulb,
  Briefcase,
  Loader2,
  Presentation,
  Users,
  Mic,
  ChevronLeft,
  Eye,
  Video,
  VideoOff,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const SCENARIO_CONFIG: Record<string, { label: string; icon: LucideIcon }> = {
  INTERVIEW: { label: "Interview", icon: Briefcase },
  PITCH: { label: "Pitch", icon: Presentation },
  MEETING: { label: "Meeting", icon: Users },
};

const DONE_STATUSES = new Set(["READY", "FAILED"]);

type VisionData = {
  score?: number;
  available?: boolean;
  reason?: string;
  eye_contact?: number | null;
  posture_score?: number | null;
  stability?: number | null;
  face_present_ratio?: number | null;
  sample_count?: number;
};

function pct(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "—";
  return `${Math.round(value * 100)}%`;
}

function RadialScore({
  value,
  label,
  size = 120,
}: {
  value: number;
  label: string;
  size?: number;
}) {
  const r = size * 0.38;
  const circ = 2 * Math.PI * r;
  const fill = circ * (1 - Math.min(1, Math.max(0, value)));
  const strokeWidth = size * 0.08;

  return (
    <div className="flex flex-col items-center gap-3 shrink-0">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            className="stroke-muted"
            strokeOpacity={0.25}
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            className="stroke-primary"
            strokeWidth={strokeWidth}
            strokeDasharray={circ}
            strokeDashoffset={fill}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
          />
        </svg>
        <div
          className="absolute inset-0 flex items-center justify-center font-bold text-foreground"
          style={{ fontSize: size * 0.22 }}
        >
          {Math.round(value * 100)}%
        </div>
      </div>
      <span className="text-sm font-medium text-muted-foreground text-center">
        {label}
      </span>
    </div>
  );
}

function MetricTile({
  label,
  value,
  className = "text-primary",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="text-center p-4 rounded-lg bg-secondary/30 border border-border">
      <div className={`text-2xl md:text-3xl font-bold ${className}`}>{value}</div>
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-1">
        {label}
      </div>
    </div>
  );
}

function VisionSection({ vision }: { vision: VisionData }) {
  if (!vision.available) {
    return (
      <div className="card-elevated p-6">
        <div className="flex items-center gap-2 mb-3">
          <VideoOff className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">On-Camera Presence</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Camera metrics were not included in this score. Start the camera during
          your next session for eye contact, posture, and stability analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="card-elevated p-6">
      <div className="flex items-center gap-2 mb-5">
        <Video className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">On-Camera Presence</h3>
        <span className="ml-auto text-xs text-muted-foreground">
          {vision.sample_count ?? 0} frames analyzed
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricTile label="Presence" value={pct(vision.score)} className="text-primary" />
        <MetricTile label="Eye contact" value={pct(vision.eye_contact)} className="text-chart-2" />
        <MetricTile label="Posture" value={pct(vision.posture_score)} className="text-success" />
        <MetricTile label="Stability" value={pct(vision.stability)} className="text-warning" />
      </div>
      <p className="text-xs text-muted-foreground mt-4">
        Derived from live camera analysis during your session and factored into your
        overall confidence score.
      </p>
    </div>
  );
}

export default function InsightsPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [hasReadUrl, setHasReadUrl] = useState(false);
  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    setSessionId(sp.get("sessionId"));
    setHasReadUrl(true);
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    let alive = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const load = async () => {
      try {
        const res = await getSession(sessionId);
        if (!alive) return;
        setData(res.session);
        if (DONE_STATUSES.has(res.session?.status) && intervalId !== null) {
          clearInterval(intervalId);
          intervalId = null;
        }
      } catch {
        if (!alive) return;
        setError("Failed to load session.");
        if (intervalId !== null) clearInterval(intervalId);
      }
    };

    load();
    intervalId = setInterval(load, 2500);
    return () => {
      alive = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [sessionId]);

  if (!hasReadUrl) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Loading…
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div className="card-elevated p-8 text-center text-muted-foreground">
        Missing session ID. Open this page from your session history.
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-elevated p-8 text-center">
        <p className="text-destructive font-medium">{error}</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/history">Back to History</Link>
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Loading session data…
      </div>
    );
  }

  const analysis = data.analysis;
  const speechMetrics = analysis?.speechMetrics as Record<string, unknown> | undefined;
  const vision = (speechMetrics?.vision as VisionData | undefined) ?? {};
  const config = SCENARIO_CONFIG[data.scenario];
  const ScenarioIcon = config?.icon ?? Briefcase;

  const alignmentNotes = Array.isArray(analysis?.alignment?.notes)
    ? (analysis.alignment.notes as string[])
    : [];

  const suggestions = [
    ...(Array.isArray(analysis?.suggestions) ? analysis.suggestions : []),
    ...alignmentNotes,
  ] as string[];

  const highlights = (analysis?.highlights ?? []) as Array<
    { message?: string } | string
  >;

  return (
    <div className="animate-fade-in space-y-6 md:space-y-8 pb-8">
      {/* Header */}
      <div className="card-glow p-5 md:p-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="badge badge-primary">
                <ScenarioIcon className="h-3 w-3" />
                {config?.label ?? data.scenario}
              </span>
              <span
                className={`badge ${
                  data.status === "READY"
                    ? "badge-success"
                    : data.status === "FAILED"
                      ? "badge-destructive"
                      : "badge-muted"
                }`}
              >
                {data.status}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight truncate">
              {data.title || "Practice Session"}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              {new Date(data.createdAt).toLocaleString("en-US", {
                dateStyle: "long",
                timeStyle: "short",
              })}
            </p>
          </div>
          {analysis?.confidence != null && (
            <RadialScore
              value={analysis.confidence}
              label="Overall Confidence"
              size={130}
            />
          )}
        </div>
      </div>

      {data.status === "ANALYZING" && (
        <div className="card-elevated p-8 md:p-12 text-center">
          <Loader2 className="h-10 w-10 text-primary mx-auto mb-4 animate-spin" />
          <h3 className="font-semibold text-lg mb-2">Analyzing your performance</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Processing your transcript, speech patterns, and camera metrics. This
            usually takes 30–60 seconds.
          </p>
        </div>
      )}

      {analysis && data.status !== "ANALYZING" && (
        <>
          {/* Score breakdown */}
          <div className="card-elevated p-5 md:p-6">
            <div className="flex items-center gap-2 mb-5">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Performance Breakdown</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricTile
                label="Speech"
                value={pct(analysis.speechMetrics?.score)}
                className="text-primary"
              />
              <MetricTile
                label="Language"
                value={pct(analysis.nlpMetrics?.score)}
                className="text-chart-4"
              />
              <MetricTile
                label="Alignment"
                value={pct(analysis.alignment?.score)}
                className="text-success"
              />
              <MetricTile
                label="Overall"
                value={pct(analysis.confidence)}
                className="text-warning"
              />
            </div>
          </div>

          <VisionSection vision={vision} />

          {/* Strengths & focus */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card-elevated p-5 md:p-6 border-l-4 border-l-success">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <h3 className="font-semibold">Key Strengths</h3>
              </div>
              {(analysis.strengths ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No strengths recorded yet.</p>
              ) : (
                <ul className="space-y-3">
                  {(analysis.strengths as string[]).map((s, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-sm text-muted-foreground"
                    >
                      <Star className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="card-elevated p-5 md:p-6 border-l-4 border-l-warning">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-5 w-5 text-warning" />
                <h3 className="font-semibold">Focus Areas</h3>
              </div>
              {(analysis.weaknesses ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No focus areas flagged.</p>
              ) : (
                <ul className="space-y-3">
                  {(analysis.weaknesses as string[]).map((s, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-sm text-muted-foreground"
                    >
                      <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="card-elevated p-5 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Coaching Suggestions</h3>
              </div>
              <div className="space-y-3">
                {suggestions.map((s, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-lg bg-secondary/50 border border-border text-sm text-foreground"
                  >
                    {s}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Highlights */}
          {highlights.length > 0 && (
            <div className="card-elevated p-5 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Key Moments</h3>
              </div>
              <div className="space-y-3">
                {highlights.map((item, i) => (
                  <div
                    key={i}
                    className="bubble-ai p-4 text-sm border-l-4 border-l-primary"
                  >
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Moment {i + 1}
                    </div>
                    {typeof item === "string" ? item : item.message ?? String(item)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Transcript */}
      <div className="card-elevated p-5 md:p-6">
        <div className="flex items-center gap-2 mb-6">
          <Mic className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Full Transcript</h2>
        </div>
        {(data.segments ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No transcript available.
          </p>
        ) : (
          <div className="space-y-4 max-h-[32rem] overflow-y-auto pr-1">
            {(data.segments as Array<{ id: string; speaker: string; text: string }>).map(
              (t) => (
                <div
                  key={t.id}
                  className={`flex flex-col gap-1 ${
                    t.speaker === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide px-2">
                    {t.speaker === "ai" ? "Coach" : "You"}
                  </span>
                  <div
                    className={`max-w-[90%] md:max-w-[85%] px-4 py-3 text-sm ${
                      t.speaker === "user" ? "bubble-user" : "bubble-ai"
                    }`}
                  >
                    {t.text}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
        <Button variant="secondary" asChild className="w-full sm:w-auto">
          <Link href="/history">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to History
          </Link>
        </Button>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/session">
            <Mic className="h-4 w-4 mr-1" />
            Start New Session
          </Link>
        </Button>
      </div>
    </div>
  );
}
