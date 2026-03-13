"use client";
import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Loader } from "lucide-react";

export const SUPPORTED_LANGUAGES = [
  { code: "en-IN", name: "English", native: "English", flag: "🇮🇳" },
  { code: "hi-IN", name: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
  { code: "kn-IN", name: "Kannada", native: "ಕನ್ನಡ", flag: "🇮🇳" },
  { code: "te-IN", name: "Telugu", native: "తెలుగు", flag: "🇮🇳" },
  { code: "ta-IN", name: "Tamil", native: "தமிழ்", flag: "🇮🇳" },
  { code: "ml-IN", name: "Malayalam", native: "മലയാളം", flag: "🇮🇳" },
  { code: "mr-IN", name: "Marathi", native: "मराठी", flag: "🇮🇳" },
  { code: "bn-IN", name: "Bengali", native: "বাংলা", flag: "🇮🇳" },
  { code: "gu-IN", name: "Gujarati", native: "ગુજરાતી", flag: "🇮🇳" },
  { code: "pa-IN", name: "Punjabi", native: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
  { code: "ur-IN", name: "Urdu", native: "اردو", flag: "🇮🇳" },
  { code: "or-IN", name: "Odia", native: "ଓଡ଼ିଆ", flag: "🇮🇳" },
  { code: "as-IN", name: "Assamese", native: "অসমীয়া", flag: "🇮🇳" },
  { code: "sa-IN", name: "Sanskrit", native: "संस्कृतम्", flag: "🇮🇳" },
  { code: "sd-IN", name: "Sindhi", native: "سنڌي", flag: "🇮🇳" },
];

interface VoiceInputProps {
  lang: string;               // BCP-47 code e.g. "kn-IN"
  onTranscript: (text: string) => void;
  placeholder?: string;
  size?: "sm" | "md";
}

export default function VoiceInput({ lang, onTranscript, placeholder = "Listening...", size = "md" }: VoiceInputProps) {
  const [status, setStatus] = useState<"idle" | "listening" | "processing" | "unsupported">("idle");
  const [interim, setInterim] = useState("");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setStatus("unsupported"); return; }
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = lang;
    rec.onresult = (e: any) => {
      let finalText = "";
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalText += e.results[i][0].transcript;
        else interimText += e.results[i][0].transcript;
      }
      setInterim(interimText);
      if (finalText) { onTranscript(finalText.trim()); setInterim(""); }
    };
    rec.onerror = () => { setStatus("idle"); setInterim(""); };
    rec.onend = () => { setStatus("idle"); setInterim(""); };
    recognitionRef.current = rec;
    return () => { try { rec.abort(); } catch {} };
  }, [lang]);

  const toggle = () => {
    if (status === "unsupported") {
      alert("🎙️ Voice input is not supported in this browser.\n\nPlease use Google Chrome or Microsoft Edge for the best speech recognition experience.");
      return;
    }
    if (status === "listening") {
      recognitionRef.current?.stop();
      setStatus("idle");
    } else {
      recognitionRef.current.lang = lang;
      recognitionRef.current.start();
      setStatus("listening");
    }
  };

  const btnSize = size === "sm" ? 32 : 40;
  const iconSize = size === "sm" ? 14 : 18;

  if (status === "unsupported") {
    return (
      <div onClick={toggle} title="Voice input requires Chrome or Edge" style={{ width: btnSize, height: btnSize, borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: 0.8, flexShrink: 0 }}>
        <MicOff size={iconSize} color="#f87171" />
      </div>
    );
  }

  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 6 }}>
      <button
        type="button"
        onClick={toggle}
        title={status === "listening" ? "Click to stop" : `Speak in ${SUPPORTED_LANGUAGES.find(l => l.code === lang)?.name}`}
        style={{
          width: btnSize, height: btnSize, borderRadius: 10, border: "none", cursor: "pointer",
          background: status === "listening"
            ? "linear-gradient(135deg,#ef4444,#dc2626)"
            : "linear-gradient(135deg,#6366f1,#8b5cf6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: status === "listening" ? "0 0 0 4px rgba(239,68,68,0.2)" : undefined,
          animation: status === "listening" ? "pulse-glow 1s ease-in-out infinite" : undefined,
          transition: "all 0.2s", flexShrink: 0,
        }}
      >
        {status === "listening" ? <MicOff size={iconSize} color="white" /> : <Mic size={iconSize} color="white" />}
      </button>
      {status === "listening" && interim && (
        <div style={{
          position: "absolute", left: "calc(100% + 8px)", top: "50%", transform: "translateY(-50%)",
          background: "rgba(15,23,42,0.95)", color: "#a5b4fc", fontSize: 12,
          padding: "4px 10px", borderRadius: 8, whiteSpace: "nowrap", maxWidth: 220, overflow: "hidden",
          textOverflow: "ellipsis", border: "1px solid rgba(99,102,241,0.3)", backdropFilter: "blur(8px)", zIndex: 20,
        }}>
          🎙️ {interim || placeholder}
        </div>
      )}
    </div>
  );
}
