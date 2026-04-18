"use client";
import { useEffect, useRef, useState, useCallback } from "react";

const EMOTION_EMOJI: Record<string, string> = {
  happy:     "😊",
  neutral:   "😐",
  sad:       "😢",
  angry:     "😠",
  fearful:   "😨",
  disgusted: "🤢",
  surprised: "😲",
};

const EMOTION_LABELS: Record<string, string> = {
  happy:     "Happy 😊",
  neutral:   "Neutral 😐",
  sad:       "Sad 😢",
  angry:     "Angry 😠",
  fearful:   "Fearful 😨",
  disgusted: "Disgusted 🤢",
  surprised: "Surprised 😲",
};

const EMOTION_COLOR: Record<string, string> = {
  happy:     "#10b981",
  neutral:   "#6b7280",
  sad:       "#3b82f6",
  angry:     "#ef4444",
  fearful:   "#f59e0b",
  disgusted: "#84cc16",
  surprised: "#8b5cf6",
};

export interface EmotionState {
  emotion: string;
  emoji: string;
  label: string;
  color: string;
  confidence: number;
  allScores: Record<string, number>;
  modelReady: boolean;
}

export function useFaceEmotion(
  videoRef: React.RefObject<HTMLVideoElement>,
  intervalMs = 1200
): EmotionState {
  const [state, setState] = useState<EmotionState>({
    emotion: "neutral",
    emoji: "😐",
    label: "Neutral 😐",
    color: "#6b7280",
    confidence: 0,
    allScores: {},
    modelReady: false,
  });

  const faceApiRef = useRef<any>(null);
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load face-api.js models once
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        // Dynamically import so it only runs in the browser
        const faceapi = await import("face-api.js");
        faceApiRef.current = faceapi;

        const MODEL_URL = "/models";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);

        if (!cancelled) {
          setState((s) => ({ ...s, modelReady: true }));
          console.log("✅ face-api.js emotion models loaded");
        }
      } catch (err) {
        console.error("face-api load error:", err);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // Run detection on interval
  const detect = useCallback(async () => {
    const faceapi = faceApiRef.current;
    const video   = videoRef.current;
    if (!faceapi || !video || video.readyState < 2) return;

    try {
      const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.3 });
      const result  = await faceapi
        .detectSingleFace(video, options)
        .withFaceExpressions();

      if (!result) return;

      const expressions: Record<string, number> = result.expressions as any;
      // Find the dominant emotion
      const top = Object.entries(expressions).reduce(
        (a, b) => (b[1] > a[1] ? b : a),
        ["neutral", 0] as [string, number]
      );
      const [emotion, confidence] = top;

      setState({
        emotion,
        emoji:      EMOTION_EMOJI[emotion]  ?? "😐",
        label:      EMOTION_LABELS[emotion] ?? emotion,
        color:      EMOTION_COLOR[emotion]  ?? "#6b7280",
        confidence: Math.round(confidence * 100) / 100,
        allScores:  Object.fromEntries(
          Object.entries(expressions).map(([k, v]) => [k, Math.round((v as number) * 1000) / 1000])
        ),
        modelReady: true,
      });
    } catch {
      // silently ignore frame errors
    }
  }, [videoRef]);

  // Start interval once model is ready
  useEffect(() => {
    if (!state.modelReady) return;
    timerRef.current = setInterval(detect, intervalMs);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [state.modelReady, detect, intervalMs]);

  return state;
}

export { EMOTION_COLOR, EMOTION_LABELS, EMOTION_EMOJI };
