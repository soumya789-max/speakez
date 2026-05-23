"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Mic,
  Video,
  Briefcase,
  Presentation,
  Users,
  Settings,
  Gauge,
  User,
  Zap,
  Play,
  Square,
  Send,
  AlertCircle,
  Info,
  Loader2,
  Bot,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createSession, endSession, type Scenario } from "../../lib/api";
import { openLiveSocket } from "../../lib/socket";
import { useVisionMetrics, type VisionMetrics } from "../../hooks/useVisionMetrics";

type Turn = { speaker: "user" | "ai"; text: string };
type AudioPlayback = { context: AudioContext; nextTime: number };
type MicCapture = { stream: MediaStream; context: AudioContext; source: MediaStreamAudioSourceNode; processor: ScriptProcessorNode; silentGain: GainNode };
type VideoCapture = { stream: MediaStream; frameTimer: ReturnType<typeof setInterval> };
type PurposeMode = "practice" | "evaluate";

const SCENARIOS: {
  id: Scenario;
  label: string;
  icon: LucideIcon;
  desc: string;
  contextLabel: string;
  starter: string;
}[] = [
  {
    id: "INTERVIEW",
    label: "Interview",
    icon: Briefcase,
    desc: "Adaptive mock interview with follow-up questions",
    contextLabel: "Resume + job description",
    starter: "Hi, I'm ready for the interview.",
  },
  {
    id: "PITCH",
    label: "Pitch",
    icon: Presentation,
    desc: "Pitch practice with critical investor-style probing",
    contextLabel: "Pitch topic + audience notes",
    starter: "Hi, I'm ready to practice my pitch.",
  },
  {
    id: "MEETING",
    label: "Meeting",
    icon: Users,
    desc: "Meeting simulation with stakeholder dynamics",
    contextLabel: "Meeting goal + stakeholder notes",
    starter: "Hi, I'm ready for the meeting simulation.",
  },
];

const PERSONAS = [
  { id: "DEFAULT", label: "Standard", desc: "Balanced, professional coach" },
  { id: "THE_SKEPTIC", label: "The Skeptic", desc: "Challenges every claim" },
  { id: "THE_FRIENDLY", label: "The Mentor", desc: "Supportive and encouraging" },
  { id: "THE_RUSHED", label: "The Rushed Manager", desc: "Demands concise updates" },
  { id: "THE_PANEL", label: "The Tough Panel", desc: "Rapid-fire questions" },
  { id: "THE_CONFUSED", label: "The Confused Stakeholder", desc: "Needs simple explanations" }
];

const PRESSURE_LEVELS = [
  { level: 0, label: "None" },
  { level: 1, label: "Mild" },
  { level: 2, label: "Moderate" },
  { level: 3, label: "High" }
];

function ArcGauge({ value, label, color = "#6366f1" }: { value: number; label: string; color?: string }) {
  const r = 22, circ = Math.PI * r;
  const fill = circ * (1 - Math.min(value, 1));
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}>
      <svg width="56" height="34" viewBox="0 0 56 34">
        <path d="M6,30 A22,22 0 0,1 50,30" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="5" strokeLinecap="round" />
        <path d="M6,30 A22,22 0 0,1 50,30" fill="none" stroke={color}
          strokeWidth="5" strokeLinecap="round"
          strokeDasharray={`${circ}`} strokeDashoffset={fill} />
        <text x="28" y="30" textAnchor="middle" fontSize="10" fontWeight="700" fill="#e2e8f0">
          {Math.round(value * 100)}%
        </text>
      </svg>
      <span style={{ fontSize: "0.65rem", color: "var(--text-3)" }}>{label}</span>
    </div>
  );
}

export default function LiveSessionPage() {
  const [scenario, setScenario] = useState<Scenario>("INTERVIEW");
  const [persona, setPersona] = useState<string>("DEFAULT");
  const [pressureLevel, setPressureLevel] = useState<number>(0);
  const [title, setTitle] = useState("Mock interview");
  const [purposeMode, setPurposeMode] = useState<PurposeMode>("practice");
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [topicNotes, setTopicNotes] = useState("");
  const [freeText, setFreeText] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [nudges, setNudges] = useState<{ level: "info" | "warn"; message: string }[]>([]);
  const [status, setStatus] = useState<"setup" | "live" | "ending">("setup");
  const [isStreamingMic, setIsStreamingMic] = useState(false);
  const [isStreamingVideo, setIsStreamingVideo] = useState(false);
  const [visionMetrics, setVisionMetrics] = useState<VisionMetrics | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const socketRef = useRef<ReturnType<typeof openLiveSocket> | null>(null);
  const audioPlaybackRef = useRef<AudioPlayback | null>(null);
  const micCaptureRef = useRef<MicCapture | null>(null);
  const videoCaptureRef = useRef<VideoCapture | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isAnalyzingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const { analyze: analyzeVision } = useVisionMetrics(videoRef);
  const canUseMic = useMemo(() => typeof window !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia), []);

  useEffect(() => () => {
    socketRef.current?.close();
    void audioPlaybackRef.current?.context.close();
    stopMicStream(); stopVideoStream();
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  function chooseScenario(s: Scenario) {
    setScenario(s);
    const defaultTitles = ["Mock interview", "Pitch practice", "Meeting simulation"];
    setTitle((t) => defaultTitles.includes(t) ? SCENARIOS.find((x) => x.id === s)!.label + (s === "INTERVIEW" ? " practice" : s === "PITCH" ? " practice" : " simulation") : t);
  }

  function ensureAudioPlayback() {
    if (!audioPlaybackRef.current) {
      const Ctx = window.AudioContext || (window as never as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioPlaybackRef.current = { context: new Ctx(), nextTime: 0 };
    }
    void audioPlaybackRef.current.context.resume();
    return audioPlaybackRef.current;
  }

  function playPcmAudio(data: string, mimeType: string) {
    const playback = ensureAudioPlayback();
    const binary = window.atob(data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const view = new DataView(bytes.buffer);
    const match = mimeType.match(/rate=(\d+)/i);
    const rate = match ? Number(match[1]) : 24000;
    const frameCount = Math.floor(bytes.byteLength / 2);
    const buf = playback.context.createBuffer(1, frameCount, rate);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < frameCount; i++) ch[i] = view.getInt16(i * 2, true) / 32768;
    const src = playback.context.createBufferSource();
    src.buffer = buf; src.connect(playback.context.destination);
    const at = Math.max(playback.context.currentTime + 0.02, playback.nextTime);
    src.start(at); playback.nextTime = at + buf.duration;
  }

  function floatTo16BitPcmBase64(input: Float32Array, inputSampleRate: number) {
    const targetSampleRate = 16000;
    const ratio = inputSampleRate / targetSampleRate;
    const newLength = Math.floor(input.length / ratio);
    const pcmBuffer = new Int16Array(newLength);

    for (let i = 0; i < newLength; i++) {
      const offset = Math.floor(i * ratio);
      // Clamp to [-1, 1] then scale to 16-bit range
      const sample = Math.max(-1, Math.min(1, input[offset] ?? 0));
      pcmBuffer[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
    }

    // Convert Int16Array to base64
    const bytes = new Uint8Array(pcmBuffer.buffer);
    let binary = "";
    const chunk = 8192;
    for (let i = 0; i < bytes.length; i += chunk) {
      const slice = bytes.subarray(i, i + chunk);
      binary += String.fromCharCode.apply(null, slice as any);
    }
    return window.btoa(binary);
  }

  async function startMicStream() {
    if (micCaptureRef.current || !socketRef.current) return;
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      });
      const context = new Ctx();

      // IMPORTANT: Context starts suspended in most browsers; must resume on user gesture.
      await context.resume();

      const source = context.createMediaStreamSource(stream);
      const processor = context.createScriptProcessor(4096, 1, 1);
      const silentGain = context.createGain();
      silentGain.gain.value = 0;

      processor.onaudioprocess = (e) => {
        if (!socketRef.current) return;
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmData = floatTo16BitPcmBase64(inputData, context.sampleRate);
        socketRef.current.sendAudioChunk(pcmData);
      };

      source.connect(processor);
      processor.connect(silentGain);
      silentGain.connect(context.destination);

      micCaptureRef.current = { stream, context, source, processor, silentGain };
      setIsStreamingMic(true);
    } catch (err) {
      console.error("[mic] failed to start stream", err);
      setNudges((x) => [{ level: "warn" as const, message: "Could not access microphone." }, ...x].slice(0, 5));
    }
  }

  function stopMicStream() {
    const c = micCaptureRef.current; if (!c) return;
    c.processor.disconnect(); c.silentGain.disconnect(); c.source.disconnect();
    c.stream.getTracks().forEach((t) => t.stop()); void c.context.close();
    micCaptureRef.current = null; socketRef.current?.endAudio(); setIsStreamingMic(false);
  }

  async function captureVideoFrame() {
    const video = videoRef.current, canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2 || !socketRef.current) return;
    const w = 320, h = Math.max(1, Math.round((video.videoHeight / Math.max(1, video.videoWidth)) * w));
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    const [, data] = canvas.toDataURL("image/jpeg", 0.55).split(",");
    if (data) socketRef.current.sendVideoFrame(data, "image/jpeg");
    if (isAnalyzingRef.current) return;
    isAnalyzingRef.current = true;
    try {
      const m = await analyzeVision();
      setVisionMetrics(m);
      socketRef.current?.sendVisionMetrics(m);
      const msgs: string[] = [];
      if (!m.face_present) msgs.push("Move into frame — camera can't detect your face.");
      if (m.eye_contact < 0.45) msgs.push("Look closer to the camera for stronger eye contact.");
      if (m.posture === "needs_work") msgs.push("Square your shoulders and sit a bit taller.");
      if (m.movement > 0.55) msgs.push("Reduce head movement to look steadier.");
      if (msgs[0]) setNudges((x) => [{ level: "info" as const, message: msgs[0]! }, ...x].slice(0, 5));
    } catch { /* ignore */ } finally { isAnalyzingRef.current = false; }
  }

  async function startVideoStream() {
    if (videoCaptureRef.current || !socketRef.current) return;
    const stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" } });
    if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
    const frameTimer = setInterval(() => void captureVideoFrame(), 1000);
    videoCaptureRef.current = { stream, frameTimer }; setIsStreamingVideo(true);
    setNudges((x) => [{ level: "info" as const, message: "Camera on. Keep your face centered and well lit." }, ...x].slice(0, 5));
    void captureVideoFrame();
  }

  function stopVideoStream() {
    const c = videoCaptureRef.current; if (!c) return;
    clearInterval(c.frameTimer); c.stream.getTracks().forEach((t) => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    videoCaptureRef.current = null; setVisionMetrics(null); setIsStreamingVideo(false);
  }

  async function start() {
    try {
      const sc = SCENARIOS.find((x) => x.id === scenario)!;
      const { session } = await createSession({
        scenario, title, persona, pressureLevel,
        resumeText: resumeText || undefined, jobDescription: jobDescription || undefined,
        topicNotes: topicNotes || undefined,
        freeText: (freeText || "") + (purposeMode === "evaluate" ? "\n\nMode: Evaluate — score the user strictly, highlight every weakness explicitly." : "")
      });
      setSessionId(session.id); setTurns([]); setNudges([]); setStatus("live");
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000)), 1000);
      ensureAudioPlayback();
      const socket = openLiveSocket({
        sessionId: session.id,
        onAi: (text) => setTurns((t) => [...t, { speaker: "ai", text }]),
        onUserTranscript: (text) => setTurns((t) => [...t, { speaker: "user", text }]),
        onAiAudio: (audio) => playPcmAudio(audio.data, audio.mimeType),
      onNudge: (n) => setNudges((x) => [n as { level: "info" | "warn"; message: string }, ...x].slice(0, 5)),
      onError: (msg) => setNudges((x) => [{ level: "warn" as const, message: msg }, ...x].slice(0, 5))
      });
      socketRef.current = socket; socket.sendUserText(sc.starter);
    } catch (e) {
      setNudges([{ level: "warn" as const, message: e instanceof Error ? e.message : "Failed to start session." }]);
      setStatus("setup");
    }
  }

  function send() {
    const text = draft.trim(); if (!text || !sessionId) return;
    setTurns((t) => [...t, { speaker: "user", text }]);
    socketRef.current?.sendUserText(text); setDraft("");
  }

  async function finish() {
    if (!sessionId) return; setStatus("ending");
    stopMicStream(); stopVideoStream(); socketRef.current?.close();
    if (timerRef.current) clearInterval(timerRef.current);
    try { await endSession(sessionId); window.location.href = `/insights?sessionId=${encodeURIComponent(sessionId)}`; }
    catch (e) {
      setNudges((x) => [{ level: "warn" as const, message: e instanceof Error ? e.message : "Failed to end session." }, ...x].slice(0, 5));
      setStatus("live");
    }
  }

  const fmtTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const sc = SCENARIOS.find((x) => x.id === scenario)!;

  // ── Setup screen ──────────────────────────────────────────────────────────
  if (status === "setup") return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
          <Mic className="h-7 w-7 text-primary" />
          Live Session
        </h1>
        <p className="text-muted-foreground mt-2">
          Choose your scenario, set your context, then practice with live AI coaching.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {SCENARIOS.map((s) => {
          const Icon = s.icon;
          const isActive = scenario === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => chooseScenario(s.id)}
              className={`p-5 rounded-lg border text-left transition-all ${
                isActive
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border bg-card hover:border-primary/50"
              }`}
            >
              <Icon className={`h-6 w-6 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              <div className={`font-semibold mt-3 ${isActive ? "text-primary" : "text-foreground"}`}>
                {s.label}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
            </button>
          );
        })}
      </div>

      <div className="card-elevated p-5">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Purpose Mode</span>
        </div>
        <div className="flex gap-3">
          {(["practice", "evaluate"] as PurposeMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setPurposeMode(m)}
              className={`flex-1 py-3 px-4 rounded-md font-medium text-sm transition-all ${
                purposeMode === m
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {m === "practice" ? (
                <span className="flex items-center justify-center gap-2">
                  <Zap className="h-4 w-4" />
                  Practice
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Gauge className="h-4 w-4" />
                  Evaluate
                </span>
              )}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          {purposeMode === "practice"
            ? "AI guides you with hints and encouragement."
            : "AI scores strictly and highlights every weakness explicitly."}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="card-elevated p-5">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">AI Persona</span>
          </div>
          <select
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
            className="input-field"
          >
            {PERSONAS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label} - {p.desc}
              </option>
            ))}
          </select>
        </div>

        <div className="card-elevated p-5">
          <div className="flex items-center gap-2 mb-4">
            <Gauge className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Pressure Level</span>
          </div>
          <div style={{ display: "flex", gap: "0.25rem" }}>
            {PRESSURE_LEVELS.map((p) => {
              const colors = ["#ffd63382", "#fb923c77", "#ff734d7d", "#fc060676"];
              const activeColor = colors[p.level];
              const isActive = pressureLevel === p.level;
              
              return (
                <button key={p.level} onClick={() => setPressureLevel(p.level)} style={{
                  flex: 1, padding: "0.45rem 0", borderRadius: "var(--radius-md)", cursor: "pointer",
                  fontFamily: "inherit", fontSize: "0.85rem", fontWeight: 600, border: "none",
                  background: isActive ? activeColor : "rgba(255,255,255,0.05)",
                  color: isActive ? "#000" : "var(--text-2)",
                  boxShadow: isActive ? `0 0 15px ${activeColor}44` : "none",
                  transition: "all 0.15s",
                  opacity: isActive ? 1 : 0.7
                }}>
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card-elevated p-5 space-y-5">
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Session Context ({sc.contextLabel})</span>
        </div>
        <div>
          <label style={{ fontSize: "0.82rem", color: "var(--text-3)", display: "block", marginBottom: "0.35rem" }}>Session title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label style={{ fontSize: "0.82rem", color: "var(--text-3)", display: "block", marginBottom: "0.35rem" }}>Resume / background</label>
            <textarea value={resumeText} onChange={(e) => setResumeText(e.target.value)} rows={5} placeholder="Experience, skills, projects..." className="input-field resize-none" />
          </div>
          <div>
            <label style={{ fontSize: "0.82rem", color: "var(--text-3)", display: "block", marginBottom: "0.35rem" }}>Role / audience / topic</label>
            <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} rows={5} placeholder="Job description, pitch audience, stakeholders..." className="input-field resize-none" />
          </div>
          <div>
            <label style={{ fontSize: "0.82rem", color: "var(--text-3)", display: "block", marginBottom: "0.35rem" }}>Topic notes</label>
            <textarea value={topicNotes} onChange={(e) => setTopicNotes(e.target.value)} rows={4} placeholder="Agenda, key points..." className="input-field resize-none" />
          </div>
          <div>
            <label style={{ fontSize: "0.82rem", color: "var(--text-3)", display: "block", marginBottom: "0.35rem" }}>Extra instructions</label>
            <textarea value={freeText} onChange={(e) => setFreeText(e.target.value)} rows={4} placeholder="Anything extra for the AI to know..." className="input-field resize-none" />
          </div>
        </div>
        <div className="flex justify-center pt-2">
          <Button size="lg" onClick={start} className="gap-2 px-8">
            <Play className="h-5 w-5" />
            Start {sc.label}
          </Button>
        </div>
      </div>
    </div>
  );

  // ── Live screen ──────────────────────────────────────────────────────────
  return (
    <div className="animate-fade-in" style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.25rem", height: "calc(100vh - 5rem)", maxHeight: "800px" }}>
      {/* Chat panel */}
      <div className="card" style={{ display: "flex", flexDirection: "column", padding: "1.25rem" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span className="animate-live" style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f43f5e", display: "inline-block" }} />
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#fda4af", letterSpacing: "0.08em" }}>LIVE</span>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{title}</div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>{sc.label} · {purposeMode}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-2)", fontVariantNumeric: "tabular-nums" }}>{fmtTime(elapsed)}</span>
            <button onClick={finish} disabled={status === "ending"} className="btn btn-danger" style={{ fontSize: "0.8rem", padding: "0.4rem 0.85rem" }}>
              {status === "ending" ? "Ending…" : "End & Analyze"}
            </button>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.75rem", paddingRight: "0.25rem" }}>
          {turns.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <Loader2 className="h-8 w-8 text-primary mx-auto mb-3 animate-spin" />
              Connecting to AI coach…
            </div>
          )}
          {turns.map((t, i) => (
            <div key={i} className={`animate-slide-up ${t.speaker === "user" ? "bubble-user" : "bubble-ai"}`}
              style={{ maxWidth: "88%", padding: "0.75rem 1rem", alignSelf: t.speaker === "user" ? "flex-end" : "flex-start" }}>
              <div className="text-[0.68rem] text-muted-foreground mb-1 font-semibold flex items-center gap-1">
                {t.speaker === "ai" ? (
                  <><Bot className="h-3 w-3" /> Coach</>
                ) : (
                  <><User className="h-3 w-3" /> You</>
                )}
              </div>
              <div style={{ fontSize: "0.875rem", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{t.text}</div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", flexShrink: 0 }}>
          <input value={draft} onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Type a response or use mic…" className="input-field" style={{ flex: 1 }} />
          {canUseMic && (
            <Button
              type="button"
              variant={isStreamingMic ? "destructive" : "secondary"}
              size="icon"
              onClick={() => isStreamingMic ? stopMicStream() : void startMicStream()}
              title="Microphone"
            >
              {isStreamingMic ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          )}
          <Button type="button" onClick={send} className="gap-2">
            <Send className="h-4 w-4" />
            Send
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
        {/* Camera */}
        <div className="card" style={{ padding: "1rem" }}>
          <div className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <Video className="h-4 w-4" />
            Camera
          </div>
          <div style={{ borderRadius: "var(--radius-md)", overflow: "hidden", background: "#000", aspectRatio: "4/3" }}>
            <video ref={videoRef} muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover", opacity: isStreamingVideo ? 1 : 0.2 }} />
            <canvas ref={canvasRef} style={{ display: "none" }} />
          </div>
          <button onClick={() => isStreamingVideo ? stopVideoStream() : void startVideoStream()}
            className={`btn ${isStreamingVideo ? "btn-danger" : "btn-ghost"}`}
            style={{ marginTop: "0.6rem", width: "100%", justifyContent: "center", fontSize: "0.8rem" }}>
            {isStreamingVideo ? "Stop camera" : "Start camera"}
          </button>

          {/* Arc gauges */}
          {visionMetrics && (
            <div style={{ display: "flex", justifyContent: "space-around", marginTop: "0.75rem" }}>
              <ArcGauge value={visionMetrics.eye_contact} label="Eye" color="#6366f1" />
              <ArcGauge value={visionMetrics.posture === "good" ? 1 : visionMetrics.posture === "ok" ? 0.6 : 0.3} label="Posture" color="#10b981" />
              <ArcGauge value={Math.max(0, 1 - visionMetrics.movement)} label="Steady" color="#f59e0b" />
            </div>
          )}
        </div>

        {/* Nudges */}
        <div className="card" style={{ flex: 1, padding: "1rem", overflow: "hidden" }}>
          <div className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Live Nudges
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", overflowY: "auto", maxHeight: "100%" }}>
            {nudges.length === 0 && (
              <div style={{ fontSize: "0.8rem", color: "var(--text-3)" }}>Pace and clarity signals will appear here.</div>
            )}
            {nudges.map((n, i) => (
              <div
                key={i}
                className={`animate-slide-in flex items-start gap-2 p-3 rounded-md text-sm border ${
                  n.level === "warn"
                    ? "bg-warning/10 border-warning/25 text-warning-foreground"
                    : "bg-secondary/50 border-border text-muted-foreground"
                }`}
              >
                {n.level === "warn" ? (
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                ) : (
                  <Info className="h-4 w-4 shrink-0 mt-0.5" />
                )}
                <span>{n.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
