"use client";
import { useState, useRef } from "react";
import { Mic, Video, Square, Play, ShieldAlert, CheckCircle } from "lucide-react";

export default function HiddenEvidenceRecorder({ onRecord }: { onRecord: (url: string) => void }) {
  const [recording, setRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<"audio" | "video">("audio");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const startRecording = async (type: "audio" | "video") => {
    try {
      setMode(type);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === "video" ? { facingMode: "environment" } : false
      });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: type === "video" ? "video/webm" : "audio/webm" });
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
        onRecord(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      alert("Microphone/Camera access required for capturing evidence.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  return (
    <div style={{ background: "rgba(220,38,38,0.05)", border: "1px dashed rgba(220,38,38,0.3)", borderRadius: 12, padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <ShieldAlert size={18} color="#ef4444" />
        <span style={{ fontSize: 13, fontWeight: 700, color: "#fca5a5" }}>Secure Evidence Capture</span>
        <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: "auto" }}>(Stored locally, no cloud upload during recording)</span>
      </div>

      {!recordedUrl && !recording && (
        <div style={{ display: "flex", gap: 12 }}>
          <button type="button" onClick={() => startRecording("audio")} style={{ flex: 1, padding: "10px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer" }}>
            <Mic size={16} /> Record Audio
          </button>
          <button type="button" onClick={() => startRecording("video")} style={{ flex: 1, padding: "10px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer" }}>
            <Video size={16} /> Record Video
          </button>
        </div>
      )}

      {recording && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(0,0,0,0.3)", padding: "10px 16px", borderRadius: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444", animation: "pulse-glow 1s infinite" }}></div>
            <span style={{ fontSize: 13, color: "#ef4444", fontWeight: 600 }}>Recording {mode}...</span>
            {mode === "video" && <span style={{ fontSize: 11, color: "#64748b" }}>(Hidden preview mode)</span>}
          </div>
          <button type="button" onClick={stopRecording} style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)", color: "#fca5a5", padding: "6px 12px", borderRadius: 6, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
            <Square size={14} /> Stop
          </button>
        </div>
      )}

      {recordedUrl && !recording && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", padding: "12px 16px", borderRadius: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <CheckCircle size={16} color="#10b981" />
            <span style={{ fontSize: 13, color: "#34d399", fontWeight: 600 }}>Evidence Captured Successfully</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={() => {
               const a = document.createElement("a");
               a.href = recordedUrl;
               a.target = "_blank";
               a.click();
            }} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "white", padding: "6px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
              <Play size={12} /> Preview
            </button>
            <button type="button" onClick={() => { setRecordedUrl(null); onRecord(""); }} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "#94a3b8", padding: "6px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer" }}>
              Retake
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
