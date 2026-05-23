import { Calendar } from "lucide-react";
import { listSessions } from "../../lib/api";
import { HistoryClient } from "@/components/HistoryClient";

export const metadata = { title: "Session History – SpeakEZ" };

export default async function HistoryPage() {
  const { sessions } = await listSessions().catch(() => ({ sessions: [] }));

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
          <Calendar className="h-7 w-7 text-primary" />
          Session History
        </h1>
        <p className="text-muted-foreground mt-2">
          Review transcripts and insights from all your past practice sessions.
        </p>
      </div>
      <HistoryClient sessions={sessions} />
    </div>
  );
}
