"use client";

import React, { useRef, useState } from "react";
import { useFaceEmotion } from "@/hooks/useFaceEmotion";
import { useCamera } from "../../hooks/useCamera";
import { useMediapipe } from "../../hooks/useMediaPipe";
import { Switch } from "@/components/ui/switch";
import { Label } from "@radix-ui/react-label";
import {
  Hand,
  Eye,
  Activity,
  Layers,
  AlertTriangle,
  CheckCircle,
  Camera as CameraIcon,
  TrendingUp,
} from "lucide-react";

// ─── Metric Card ─────────────────────────────────────────────────────────────
function MetricCard({
  icon: Icon,
  label,
  status,
  isGood,
  count,
  duration,
  accentColor,
}: {
  icon: React.ElementType;
  label: string;
  status: string;
  isGood: boolean;
  count: number;
  duration: number;
  accentColor: string;
}) {
  return (
    <div
      className="rounded-xl p-3 border transition-all"
      style={{
        background: `linear-gradient(135deg, ${accentColor}10 0%, transparent 100%)`,
        borderColor: `${accentColor}25`,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color: accentColor }} />
          <span className="text-xs font-semibold text-slate-300">{label}</span>
        </div>
        <div
          className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
          style={{
            background: isGood ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
            color: isGood ? "#34d399" : "#f87171",
          }}
        >
          {isGood ? <CheckCircle className="w-2.5 h-2.5" /> : <AlertTriangle className="w-2.5 h-2.5" />}
          {status}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2">
        <div>
          <p className="text-[10px] text-slate-500 mb-0.5">Count</p>
          <p className="text-lg font-bold" style={{ color: accentColor }}>{count}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-500 mb-0.5">Duration</p>
          <p className="text-lg font-bold text-slate-300">{duration.toFixed(1)}<span className="text-xs text-slate-500 ml-0.5">s</span></p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="metric-bar mt-2">
        <div
          className="metric-bar-fill"
          style={{
            width: `${Math.min(100, (count / Math.max(count, 10)) * 100)}%`,
            background: `linear-gradient(90deg, ${accentColor}80, ${accentColor})`,
          }}
        />
      </div>
    </div>
  );
}

const Camera: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [overlayEnabled, setOverlayEnabled] = useState(true);

  // ── Browser-native emotion detection (face-api.js) ────────────────────────
  const emotionState = useFaceEmotion(videoRef, 1200);
  const { emotion, label: emotionLabel, color: badgeColor, confidence: emotionConfidence,
          allScores, modelReady: emotionModelReady } = emotionState;

  useCamera(videoRef);

  const {
    handPresence,
    facePresence,
    handDetectionCounter,
    handDetectionDuration,
    notFacingCounter,
    notFacingDuration,
    badPostureDetectionCounter,
    badPostureDuration,
    isHandOnScreenRef,
    notFacingRef,
    hasBadPostureRef,
  } = useMediapipe(videoRef, canvasRef, overlayEnabled);

  return (
    <div
      className="flex flex-col h-full p-4 gap-4"
      style={{ fontFamily: "'Inter', sans-serif", background: "rgba(0,0,0,0.2)" }}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <CameraIcon className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Body Language</h2>
            <p className="text-[10px] text-slate-500">Real-time analysis</p>
          </div>
        </div>

        {/* Overlay Toggle */}
        <div className="flex items-center gap-2">
          <Switch
            id="overlay-toggle"
            checked={overlayEnabled}
            onCheckedChange={() => setOverlayEnabled((p) => !p)}
            className="scale-75"
          />
          <Label htmlFor="overlay-toggle" className="text-[10px] text-slate-400 cursor-pointer">
            Skeleton
          </Label>
        </div>
      </div>

      {/* ── Camera Feed ─────────────────────────────────────────────────── */}
      <div className="camera-frame relative bg-black" style={{ aspectRatio: "4/3" }}>
        {/* ── Emotion Detection Badge (face-api.js, runs in browser) ── */}
        <div
          className="absolute top-2 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-1"
          style={{ minWidth: '130px' }}
        >
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold shadow-xl"
            style={{
              background: `${badgeColor}30`,
              border: `1.5px solid ${badgeColor}80`,
              color: badgeColor,
              backdropFilter: 'blur(10px)',
            }}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${emotionModelReady ? 'animate-record-blink' : 'opacity-30'}`}
              style={{ background: emotionModelReady ? badgeColor : '#6b7280' }}
            />
            <span>{emotionModelReady ? emotionLabel : 'Loading model…'}</span>
            {emotionConfidence > 0 && (
              <span className="text-[9px] font-normal opacity-70">{Math.round(emotionConfidence * 100)}%</span>
            )}
          </div>

          {/* Mini bars for all 7 emotions */}
          {emotionModelReady && Object.keys(allScores).length > 0 && (
            <div className="flex gap-1 px-1 bg-black/40 rounded-lg py-1">
              {['happy','neutral','sad','angry','fearful','surprised','disgusted'].map((key) => {
                const score = allScores[key] ?? 0;
                const cols: Record<string,string> = {
                  happy:'#10b981', neutral:'#6b7280', sad:'#3b82f6',
                  angry:'#ef4444', fearful:'#f59e0b', surprised:'#8b5cf6', disgusted:'#84cc16'
                };
                return (
                  <div key={key} className="flex flex-col items-center gap-0.5">
                    <div style={{ width:14, height:`${Math.max(2, Math.round(score*28))}px`,
                      background: cols[key], borderRadius:3, opacity: emotion===key ? 1 : 0.5,
                      transition:'height 0.3s ease' }} />
                    <span className="text-[7px]" style={{ color: cols[key] }}>{key.slice(0,3)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Face detection indicator */}
        <div
          className="absolute top-2 left-2 z-40 flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium"
          style={{
            background: facePresence ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)",
            border: `1px solid ${facePresence ? "rgba(52,211,153,0.4)" : "rgba(248,113,113,0.4)"}`,
            color: facePresence ? "#34d399" : "#f87171",
          }}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${facePresence ? "bg-green-400 animate-record-blink" : "bg-red-400"}`} />
          {facePresence ? "Face Detected" : "No Face"}
        </div>

        {/* Hand detection indicator */}
        {handPresence && (
          <div className="absolute top-2 right-2 z-40 flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium"
            style={{ background: "rgba(245,158,11,0.2)", border: "1px solid rgba(251,191,36,0.4)", color: "#fbbf24" }}
          >
            <Hand className="w-3 h-3" />
            Hands
          </div>
        )}

        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-10"
          style={{ transform: "scaleX(-1)" }}
        />
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="absolute inset-0 w-full h-full z-20"
          style={{ backgroundColor: "transparent", transform: "scaleX(-1)" }}
        />

        {/* Posture alert overlay */}
        {hasBadPostureRef.current && (
          <div
            className="absolute bottom-2 left-2 right-2 z-40 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium"
            style={{ background: "rgba(239,68,68,0.25)", border: "1px solid rgba(248,113,113,0.3)", color: "#fca5a5" }}
          >
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            Sit up straight — poor posture detected
          </div>
        )}

        {/* Eye contact loss alert */}
        {notFacingRef.current && !hasBadPostureRef.current && (
          <div
            className="absolute bottom-2 left-2 right-2 z-40 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium"
            style={{ background: "rgba(245,158,11,0.2)", border: "1px solid rgba(251,191,36,0.3)", color: "#fbbf24" }}
          >
            <Eye className="w-3.5 h-3.5 shrink-0" />
            Maintain eye contact with the camera
          </div>
        )}
      </div>

      {/* ── Metrics Title ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-slate-500" />
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Live Metrics</span>
        <div className="flex-1 divider-glow" />
      </div>

      {/* ── Metric Cards ─────────────────────────────────────────────────── */}
      <div className="space-y-3 pb-4">
        <MetricCard
          icon={Eye}
          label="Eye Contact"
          status={notFacingRef.current ? "Looking Away" : "Good"}
          isGood={!notFacingRef.current}
          count={notFacingCounter}
          duration={notFacingDuration}
          accentColor={notFacingCounter === 0 ? "#10b981" : notFacingCounter < 5 ? "#f59e0b" : "#ef4444"}
        />

        <MetricCard
          icon={Hand}
          label="Hand Gestures"
          status={isHandOnScreenRef.current ? "Active" : "Idle"}
          isGood={handDetectionCounter < 15}
          count={handDetectionCounter}
          duration={handDetectionDuration}
          accentColor="#f59e0b"
        />

        <MetricCard
          icon={Activity}
          label="Posture"
          status={hasBadPostureRef.current ? "Slouching" : "Upright"}
          isGood={!hasBadPostureRef.current}
          count={badPostureDetectionCounter}
          duration={badPostureDuration}
          accentColor={badPostureDetectionCounter === 0 ? "#10b981" : "#ef4444"}
        />

        {/* Summary strip */}
        <div
          className="rounded-xl p-3 border"
          style={{ background: "rgba(99,155,255,0.05)", borderColor: "rgba(99,155,255,0.15)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Overall Presence</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              {
                label: "Eye",
                value: notFacingCounter === 0 ? "✓" : notFacingCounter < 3 ? "~" : "✗",
                color: notFacingCounter === 0 ? "#34d399" : notFacingCounter < 3 ? "#fbbf24" : "#f87171",
              },
              {
                label: "Hands",
                value: handDetectionCounter < 10 ? "✓" : handDetectionCounter < 20 ? "~" : "✗",
                color: handDetectionCounter < 10 ? "#34d399" : handDetectionCounter < 20 ? "#fbbf24" : "#f87171",
              },
              {
                label: "Posture",
                value: badPostureDetectionCounter === 0 ? "✓" : badPostureDetectionCounter < 3 ? "~" : "✗",
                color: badPostureDetectionCounter === 0 ? "#34d399" : badPostureDetectionCounter < 3 ? "#fbbf24" : "#f87171",
              },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <p className="text-lg font-bold" style={{ color }}>{value}</p>
                <p className="text-[10px] text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Camera;
