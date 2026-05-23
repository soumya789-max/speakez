/**
 * Aggregates client-side MediaPipe vision samples during a live session.
 * Samples are sent over WebSocket and summarized when analysis runs.
 */

export type VisionSample = {
  eye_contact: number;
  posture: "good" | "ok" | "needs_work";
  movement: number;
  face_present: boolean;
};

export type VisionSummary = {
  avg_eye_contact: number;
  posture_good_ratio: number;
  avg_movement: number;
  face_present_ratio: number;
  sample_count: number;
};

class VisionMetricsStore {
  private samples = new Map<string, VisionSample[]>();

  append(sessionId: string, sample: VisionSample) {
    if (!sessionId) return;
    const list = this.samples.get(sessionId) ?? [];
    list.push(sample);
    this.samples.set(sessionId, list);
  }

  popSummary(sessionId: string): VisionSummary | null {
    if (!sessionId) return null;
    const list = this.samples.get(sessionId) ?? [];
    this.samples.delete(sessionId);

    if (list.length === 0) return null;

    const withFace = list.filter((s) => s.face_present);
    const postureGood = list.filter((s) => s.posture === "good").length;

    const avgEye =
      withFace.length > 0
        ? withFace.reduce((sum, s) => sum + s.eye_contact, 0) / withFace.length
        : 0;

    const avgMovement =
      list.reduce((sum, s) => sum + s.movement, 0) / list.length;

    return {
      avg_eye_contact: Number(avgEye.toFixed(3)),
      posture_good_ratio: Number((postureGood / list.length).toFixed(3)),
      avg_movement: Number(avgMovement.toFixed(3)),
      face_present_ratio: Number((withFace.length / list.length).toFixed(3)),
      sample_count: list.length,
    };
  }

  clear(sessionId: string) {
    this.samples.delete(sessionId);
  }
}

export const visionMetricsStore = new VisionMetricsStore();
