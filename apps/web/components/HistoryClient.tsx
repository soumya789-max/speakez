"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Briefcase,
  Presentation,
  Users,
  ChevronRight,
  Filter,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SessionListItem } from "@/lib/api";

type FilterScenario = "ALL" | "INTERVIEW" | "PITCH" | "MEETING";
type FilterStatus = "ALL" | "READY" | "ANALYZING" | "FAILED";

const SCENARIO_CONFIG: Record<
  string,
  { label: string; icon: typeof Briefcase }
> = {
  INTERVIEW: { label: "Interview", icon: Briefcase },
  PITCH: { label: "Pitch", icon: Presentation },
  MEETING: { label: "Meeting", icon: Users },
};

export function HistoryClient({ sessions }: { sessions: SessionListItem[] }) {
  const [scenarioFilter, setScenarioFilter] = useState<FilterScenario>("ALL");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("ALL");

  const filtered = sessions.filter((s) => {
    if (scenarioFilter !== "ALL" && s.scenario !== scenarioFilter) return false;
    if (statusFilter !== "ALL" && s.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Scenario:</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["ALL", "INTERVIEW", "PITCH", "MEETING"] as FilterScenario[]).map(
            (s) => (
              <Button
                key={s}
                variant={scenarioFilter === s ? "default" : "secondary"}
                size="sm"
                onClick={() => setScenarioFilter(s)}
              >
                {s === "ALL" ? "All" : SCENARIO_CONFIG[s]?.label}
              </Button>
            )
          )}
        </div>

        <div className="w-px h-6 bg-border hidden sm:block" />

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["ALL", "READY", "ANALYZING", "FAILED"] as FilterStatus[]).map(
            (s) => (
              <Button
                key={s}
                variant={statusFilter === s ? "default" : "secondary"}
                size="sm"
                onClick={() => setStatusFilter(s)}
              >
                {s === "ALL" ? "All" : s}
              </Button>
            )
          )}
        </div>

        <span className="ml-auto text-sm text-muted-foreground">
          {filtered.length} session{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="card-elevated p-12 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No sessions found</h3>
          <p className="text-muted-foreground">
            No sessions match your current filters.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => {
            const config = SCENARIO_CONFIG[s.scenario];
            const Icon = config?.icon ?? Briefcase;

            return (
              <Link
                key={s.id}
                href={`/insights?sessionId=${encodeURIComponent(s.id)}`}
                className="card-elevated p-5 hover:border-primary/50 transition-all group no-underline"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="badge badge-primary">
                    <Icon className="h-3 w-3" />
                    {config?.label}
                  </div>
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
                </div>

                <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {s.title || `${config?.label} session`}
                </h3>

                <p className="text-sm text-muted-foreground mb-4">
                  {new Date(s.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                  {" at "}
                  {new Date(s.createdAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>

                <div className="flex items-center text-sm text-primary font-medium">
                  View insights
                  <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
