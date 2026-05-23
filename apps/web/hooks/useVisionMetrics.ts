import { useRef } from "react";

type Posture = "good" | "ok" | "needs_work";
export type VisionMetrics = {
  eye_contact: number;
  posture: Posture;
  movement: number;
  face_present: boolean;
};

type Landmark = { x: number; y: number; z?: number };
type FaceLandmarks = Array<Array<Landmark>>;

type FaceLandmarkerInstance = {
  detect: (image: TexImageSource) => { faceLandmarks?: FaceLandmarks };
  close?: () => void;
};

type VisionRuntime = {
  faceLandmarker: FaceLandmarkerInstance;
};

const FACE_MODEL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

const MAX_DETECT_WIDTH = 480;
const WASM_PATH = "/mediapipe/wasm";

let sharedRuntime: Promise<VisionRuntime> | null = null;

async function createRuntime(): Promise<VisionRuntime> {
  const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");

  const vision = await FilesetResolver.forVisionTasks(WASM_PATH);

  const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: FACE_MODEL, delegate: "CPU" },
    runningMode: "IMAGE",
    numFaces: 1,
    outputFaceBlendshapes: false,
    outputFacialTransformationMatrixes: false,
  });

  return { faceLandmarker };
}

function getRuntime(): Promise<VisionRuntime> {
  if (!sharedRuntime) {
    sharedRuntime = createRuntime().catch((err) => {
      sharedRuntime = null;
      throw err;
    });
  }
  return sharedRuntime;
}

function isVideoReady(video: HTMLVideoElement) {
  return (
    video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
    video.videoWidth > 0 &&
    video.videoHeight > 0 &&
    !video.ended
  );
}

function eyeContactFromFace(landmarks: FaceLandmarks): number {
  if (!landmarks.length) return 0;
  const face = landmarks[0];
  const leftIris = face?.[468];
  const rightIris = face?.[473];
  if (!leftIris || !rightIris) return 0.5;
  const avgX = (leftIris.x + rightIris.x) / 2;
  return Math.max(0, 1 - Math.abs(avgX - 0.5) * 4);
}

/** Head tilt from cheek landmarks when pose model is not used. */
function postureFromFace(landmarks: FaceLandmarks): Posture {
  if (!landmarks.length) return "ok";
  const face = landmarks[0];
  const leftCheek = face?.[234];
  const rightCheek = face?.[454];
  if (!leftCheek || !rightCheek) return "ok";
  const tilt = Math.abs(leftCheek.y - rightCheek.y);
  if (tilt > 0.04) return "needs_work";
  return "good";
}

async function frameBitmap(video: HTMLVideoElement): Promise<ImageBitmap | null> {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh) return null;

  const w = vw <= MAX_DETECT_WIDTH ? vw : MAX_DETECT_WIDTH;
  const h = vw <= MAX_DETECT_WIDTH ? vh : Math.max(1, Math.round((vh * MAX_DETECT_WIDTH) / vw));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(video, 0, 0, w, h);

  try {
    return await createImageBitmap(canvas);
  } catch {
    return null;
  }
}

export const useVisionMetrics = (videoRef: React.RefObject<HTMLVideoElement | null>) => {
  const lastNoseRef = useRef<{ x: number; y: number } | null>(null);
  const detectQueueRef = useRef<Promise<VisionMetrics> | null>(null);

  function reset() {
    lastNoseRef.current = null;
  }

  function movementFromFace(landmarks: FaceLandmarks): number {
    if (!landmarks.length) return 0;
    const nose = landmarks[0]?.[1];
    if (!nose) return 0;
    if (!lastNoseRef.current) {
      lastNoseRef.current = { x: nose.x, y: nose.y };
      return 0;
    }
    const dx = nose.x - lastNoseRef.current.x;
    const dy = nose.y - lastNoseRef.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    lastNoseRef.current = { x: nose.x, y: nose.y };
    return Math.min(1, dist * 50);
  }

  const analyze = async (): Promise<VisionMetrics> => {
    if (detectQueueRef.current) return detectQueueRef.current;

    const run = async (): Promise<VisionMetrics> => {
      const empty: VisionMetrics = {
        eye_contact: 0,
        posture: "ok",
        movement: 0,
        face_present: false,
      };

      const video = videoRef.current;
      if (!video || !isVideoReady(video)) return empty;

      const bitmap = await frameBitmap(video);
      if (!bitmap) return empty;

      try {
        const runtime = await getRuntime();
        let faceLandmarks: FaceLandmarks = [];

        try {
          const faceResult = runtime.faceLandmarker.detect(bitmap);
          faceLandmarks = faceResult?.faceLandmarks ?? [];
        } catch (e) {
          console.warn("[vision] face detect error", e);
        }

        return {
          eye_contact: Number(eyeContactFromFace(faceLandmarks).toFixed(3)),
          posture: postureFromFace(faceLandmarks),
          movement: Number(movementFromFace(faceLandmarks).toFixed(3)),
          face_present: faceLandmarks.length > 0,
        };
      } catch (err) {
        console.error("[vision] runtime error", err);
        sharedRuntime = null;
        return empty;
      } finally {
        bitmap.close();
      }
    };

    detectQueueRef.current = run().finally(() => {
      detectQueueRef.current = null;
    });
    return detectQueueRef.current;
  };

  return { analyze, reset };
};
