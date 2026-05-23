"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Volume2,
  Clock,
  Mic2,
  Layout,
  Eye,
  Zap,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";

type Issue = {
  id: string;
  icon: LucideIcon;
  title: string;
  tagline: string;
  why: string;
  signs: string[];
  drills: { title: string; steps: string }[];
  color: string;
};

const ISSUES: Issue[] = [
  {
    id: "fillers",
    icon: MessageSquare,
    title: "Filler Words",
    tagline: "Ums, uhs, and likes — the confidence killers",
    why: "Filler words signal uncertainty and erode listener trust. Replacing them with intentional pauses communicates control.",
    signs: [
      "Saying 'um', 'uh', 'like', 'you know' more than twice per minute",
      "Filling silence rather than pausing",
    ],
    drills: [
      {
        title: "The Pause Replacement",
        steps:
          "Read a paragraph aloud. Every time you feel the urge to say 'um', pause for 1 full second instead. Repeat 3x.",
      },
      {
        title: "Record + Count",
        steps:
          "Record yourself answering a question for 60s. Count every filler word. Aim to halve the count by your next attempt.",
      },
      {
        title: "Slow Start",
        steps:
          "Begin your next answer with a deliberate 1-second pause before your first word. This resets your pace and reduces opening fillers.",
      },
    ],
    color: "text-warning",
  },
  {
    id: "pace",
    icon: Clock,
    title: "Speaking Pace",
    tagline: "Too fast loses clarity; too slow loses attention",
    why: "The ideal pace for professional communication is 130–160 WPM. Nervousness pushes you faster; boredom slows you. Both cost you.",
    signs: [
      "Rushing through key points",
      "Losing breath mid-sentence",
      "Listeners asking you to repeat yourself",
    ],
    drills: [
      {
        title: "3-Speed Reading",
        steps:
          "Read a paragraph at 3 speeds: deliberate slow, comfortable, and fast. Find the speed that feels slightly slower than normal — that's your target.",
      },
      {
        title: "Record & Measure",
        steps:
          "Record 60 seconds. Count words. If over 170 WPM, practice reading the same text 30% slower.",
      },
      {
        title: "Breath Marks",
        steps:
          "Annotate a script with breath-pause markers. Force a micro-pause at every comma and a full pause at every period.",
      },
    ],
    color: "text-primary",
  },
  {
    id: "clarity",
    icon: Volume2,
    title: "Vocal Clarity",
    tagline: "Being heard clearly is a skill, not a trait",
    why: "Mumbling, trailing off at sentence ends, and swallowing consonants make you hard to follow even when your ideas are strong.",
    signs: [
      "Trailing off at the end of sentences",
      "Slurred consonants",
      "Listeners leaning in to hear you",
    ],
    drills: [
      {
        title: "Consonant Crunch",
        steps:
          "Say 'Red lorry, yellow lorry' and 'She sells seashells' 5x each, overarticulating every consonant.",
      },
      {
        title: "Upward Endings",
        steps:
          "Practice ending declarative sentences with a slight upward volume. Record and listen for trailing-off patterns.",
      },
      {
        title: "The Pencil Trick",
        steps:
          "Hold a pencil lightly between your teeth and read aloud for 2 minutes. When you remove it, your articulation improves.",
      },
    ],
    color: "text-success",
  },
  {
    id: "structure",
    icon: Layout,
    title: "Answer Structure",
    tagline: "Great ideas need a frame to land",
    why: "Unstructured answers ramble, lose the listener, and make you seem unprepared — even when you know the material.",
    signs: [
      "Giving long answers with no clear conclusion",
      "Starting your answer before knowing where it's going",
      "Repeating the same point in different words",
    ],
    drills: [
      {
        title: "STAR in 90 Seconds",
        steps:
          "Pick a past experience. Tell it in: Situation (15s), Task (15s), Action (45s), Result (15s). Exactly 90 seconds total.",
      },
      {
        title: "Bottom Line First",
        steps:
          "Practice answering questions with your conclusion first, then expand with supporting detail.",
      },
      {
        title: "3-Point Rule",
        steps:
          "Answer every open-ended question with exactly 3 points, stated clearly before you elaborate.",
      },
    ],
    color: "text-chart-4",
  },
  {
    id: "eyecontact",
    icon: Eye,
    title: "Eye Contact",
    tagline: "Presence builds trust; looking away breaks it",
    why: "In video calls, eye contact means looking at the camera — not your own face. This is a learnable physical habit.",
    signs: [
      "Looking at your own preview during video calls",
      "Scanning the screen while talking",
      "Losing track of the camera lens position",
    ],
    drills: [
      {
        title: "Sticky Dot Method",
        steps:
          "Place a small dot directly above your camera lens. Focus on the dot while speaking. Practice for 5 min daily.",
      },
      {
        title: "5-4-1 Rhythm",
        steps:
          "Hold camera eye contact for 5 seconds, glance away for 4 seconds, return for 1 second. Repeat.",
      },
      {
        title: "Record Yourself",
        steps:
          "Record a 2-min answer with video. Watch it back with no sound. Identify where your gaze goes. Correct in the next take.",
      },
    ],
    color: "text-info",
  },
  {
    id: "confidence",
    icon: Zap,
    title: "Projected Confidence",
    tagline: "Confidence is a performance, not a feeling",
    why: "Even when nervous, projecting confidence through voice, posture, and pacing creates credibility you can grow into.",
    signs: [
      "Starting sentences with 'I think' or 'Maybe' when stating facts",
      "Upward inflection on statements",
      "Shrinking physically — hunched shoulders, looking down",
    ],
    drills: [
      {
        title: "Power Pose Reset",
        steps:
          "Before any session: stand tall, hands on hips, chin up for 2 minutes.",
      },
      {
        title: "Downward Inflection",
        steps:
          "Practice ending statements with a firm, slightly downward tone. Record yourself.",
      },
      {
        title: "Certainty Language",
        steps:
          "Replace 'I think' with 'I know', 'maybe' with 'likely', 'sort of' with 'specifically'.",
      },
    ],
    color: "text-destructive",
  },
];

function IssueCard({ issue }: { issue: Issue }) {
  const [open, setOpen] = useState(false);
  const Icon = issue.icon;

  return (
    <div className="card-elevated overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full text-left p-5 flex items-center justify-between gap-4 hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-secondary flex items-center justify-center shrink-0">
            <Icon className={`h-5 w-5 ${issue.color}`} />
          </div>
          <div>
            <div className="font-semibold">{issue.title}</div>
            <div className="text-sm text-muted-foreground mt-0.5">
              {issue.tagline}
            </div>
          </div>
        </div>
        {open ? (
          <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
        )}
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-5 border-t border-border pt-5">
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">
              Why it matters
            </div>
            <p className="text-sm text-foreground">{issue.why}</p>
          </div>

          <div>
            <div className="text-sm font-semibold text-muted-foreground mb-3">
              Signs you have this issue
            </div>
            <ul className="space-y-2">
              {issue.signs.map((s, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="text-primary mt-1">•</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-sm font-semibold text-muted-foreground mb-3">
              Practice Drills
            </div>
            <div className="space-y-3">
              {issue.drills.map((d, i) => (
                <div
                  key={i}
                  className="p-4 rounded-lg bg-secondary/50 border border-border"
                >
                  <div className="font-medium text-sm mb-2">
                    {i + 1}. {d.title}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {d.steps}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SpeechSupportPage() {
  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
          <Mic2 className="h-7 w-7 text-primary" />
          Speech Support
        </h1>
        <p className="text-muted-foreground mt-2">
          Targeted exercises and drills for the most common communication issues.
        </p>
      </div>

      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 flex items-start gap-3">
        <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="text-sm">
          <strong>How to use this:</strong> Identify your top issue from the{" "}
          <Link href="/roadmap" className="text-primary hover:underline">
            Roadmap page
          </Link>
          , then find it below. Do one drill per day for a week before your next
          practice session.
        </div>
      </div>

      <div className="space-y-4">
        {ISSUES.map((issue) => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </div>
    </div>
  );
}
