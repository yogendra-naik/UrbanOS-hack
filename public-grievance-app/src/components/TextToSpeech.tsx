"use client";
import { useState, useRef } from "react";
import { Volume2, VolumeX, Pause, Play } from "lucide-react";

interface TextToSpeechProps {
  text: string;
  lang: string;       // e.g. "kn-IN"
  size?: "sm" | "md";
  label?: string;
}

export default function TextToSpeech({ text, lang, size = "md", label }: TextToSpeechProps) {
  const [status, setStatus] = useState<"idle" | "speaking" | "paused" | "unsupported">("idle");
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = () => {
    if (!("speechSynthesis" in window)) { setStatus("unsupported"); return; }
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = lang;
    utt.rate = 0.9;
    utt.pitch = 1;
    // pick best matching voice
    const voices = window.speechSynthesis.getVoices();
    const match = voices.find(v => v.lang.startsWith(lang.slice(0, 2))) || voices.find(v => v.lang === "en-IN") || voices[0];
    if (match) utt.voice = match;
    utt.onstart = () => setStatus("speaking");
    utt.onend = () => setStatus("idle");
    utt.onerror = () => setStatus("idle");
    utteranceRef.current = utt;
    window.speechSynthesis.speak(utt);
  };

  const pause = () => {
    window.speechSynthesis.pause();
    setStatus("paused");
  };

  const resume = () => {
    window.speechSynthesis.resume();
    setStatus("speaking");
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setStatus("idle");
  };

  const btnSize = size === "sm" ? 32 : 38;
  const iconSize = size === "sm" ? 14 : 16;

  if (status === "unsupported") {
    return <div style={{ fontSize: 11, color: "#475569" }}>TTS not supported</div>;
  }

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      {label && <span style={{ fontSize: 12, color: "#64748b" }}>{label}</span>}
      {status === "idle" && (
        <button type="button" onClick={speak} title="Read aloud" style={{ width: btnSize, height: btnSize, borderRadius: 10, border: "1px solid rgba(34,211,238,0.4)", background: "rgba(34,211,238,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" }}>
          <Volume2 size={iconSize} color="#22d3ee" />
        </button>
      )}
      {status === "speaking" && (
        <>
          <button type="button" onClick={pause} title="Pause" style={{ width: btnSize, height: btnSize, borderRadius: 10, border: "1px solid rgba(34,211,238,0.5)", background: "rgba(34,211,238,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", animation: "pulse-glow 1.5s ease-in-out infinite" }}>
            <Pause size={iconSize} color="#22d3ee" />
          </button>
          <button type="button" onClick={stop} title="Stop" style={{ width: btnSize, height: btnSize, borderRadius: 10, border: "1px solid rgba(239,68,68,0.4)", background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <VolumeX size={iconSize} color="#f87171" />
          </button>
        </>
      )}
      {status === "paused" && (
        <>
          <button type="button" onClick={resume} title="Resume" style={{ width: btnSize, height: btnSize, borderRadius: 10, border: "1px solid rgba(34,211,238,0.4)", background: "rgba(34,211,238,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <Play size={iconSize} color="#22d3ee" />
          </button>
          <button type="button" onClick={stop} title="Stop" style={{ width: btnSize, height: btnSize, borderRadius: 10, border: "1px solid rgba(239,68,68,0.4)", background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <VolumeX size={iconSize} color="#f87171" />
          </button>
        </>
      )}
    </div>
  );
}
