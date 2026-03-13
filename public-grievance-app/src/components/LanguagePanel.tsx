"use client";
import { useState, useCallback } from "react";
import { Globe, X, Languages, ChevronDown, Copy, Check, ArrowLeftRight } from "lucide-react";
import { SUPPORTED_LANGUAGES } from "./VoiceInput";
import TextToSpeech from "./TextToSpeech";

// MyMemory free translation API (no key needed, 10k chars/day)
async function translateText(text: string, from: string, to: string): Promise<string> {
  if (!text.trim()) return "";
  const fromCode = from.split("-")[0];
  const toCode = to.split("-")[0];
  if (fromCode === toCode) return text;
  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromCode}|${toCode}`,
      { headers: { "Accept": "application/json" } }
    );
    const data = await response.json();
    if (data.responseStatus === 200) return data.responseData.translatedText;
    return text;
  } catch {
    return text;
  }
}

interface LanguagePanelProps {
  activeLang: string;
  onLangChange: (lang: string) => void;
}

export default function LanguagePanel({ activeLang, onLangChange }: LanguagePanelProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"language" | "translate">("language");

  // Translator state
  const [srcLang, setSrcLang] = useState("en-IN");
  const [tgtLang, setTgtLang] = useState(activeLang);
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [translating, setTranslating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setTranslating(true);
    const result = await translateText(inputText, srcLang, tgtLang);
    setOutputText(result);
    setTranslating(false);
  };

  const swap = () => {
    setSrcLang(tgtLang);
    setTgtLang(srcLang);
    setInputText(outputText);
    setOutputText(inputText);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const activeLangName = SUPPORTED_LANGUAGES.find(l => l.code === activeLang);

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(true)}
        title="Language & Translation"
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 100,
          width: 54, height: 54, borderRadius: "50%",
          background: "linear-gradient(135deg,#6366f1,#22d3ee)",
          border: "none", cursor: "pointer", display: "flex",
          alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 24px rgba(99,102,241,0.45)",
          transition: "transform 0.2s",
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
      >
        <Globe size={22} color="white" />
        {/* Active lang badge */}
        <div style={{
          position: "absolute", top: -4, right: -4,
          background: "#0f172a", border: "1.5px solid rgba(99,102,241,0.5)",
          borderRadius: 999, padding: "1px 6px", fontSize: 9,
          color: "#a5b4fc", fontWeight: 700, whiteSpace: "nowrap",
        }}>
          {activeLangName?.native.slice(0, 3)}
        </div>
      </button>

      {/* Panel */}
      {open && (
        <div style={{
          position: "fixed", bottom: 90, right: 24, zIndex: 101,
          width: 360, background: "rgba(10,15,30,0.97)",
          border: "1px solid rgba(99,102,241,0.3)", borderRadius: 20,
          boxShadow: "0 20px 60px rgba(0,0,0,0.6)", backdropFilter: "blur(30px)",
          overflow: "hidden", fontFamily: "Inter, sans-serif",
        }}>
          {/* Header */}
          <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(135deg,rgba(99,102,241,0.12),rgba(34,211,238,0.06))" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Globe size={18} color="#6366f1" />
              <span style={{ fontWeight: 800, fontSize: 15, background: "linear-gradient(90deg,#6366f1,#22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Language & Voice</span>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#94a3b8", cursor: "pointer", borderRadius: 8, padding: 6, display: "flex" }}><X size={16} /></button>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", padding: "10px 16px 0", gap: 6 }}>
            {[{ k: "language", icon: "🌐", label: "Select Language" }, { k: "translate", icon: "🔀", label: "Translator" }].map(t => (
              <button key={t.k} onClick={() => setTab(t.k as any)} style={{ flex: 1, padding: "8px 6px", fontSize: 12, fontWeight: tab === t.k ? 700 : 400, background: tab === t.k ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.04)", border: `1px solid ${tab === t.k ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.07)"}`, borderRadius: 10, color: tab === t.k ? "#a5b4fc" : "#64748b", cursor: "pointer" }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <div style={{ padding: 16 }}>
            {/* Language selector tab */}
            {tab === "language" && (
              <div>
                <p style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>
                  Choose your preferred language for voice input and text-to-speech. Currently: <strong style={{ color: "#a5b4fc" }}>{activeLangName?.name} ({activeLangName?.native})</strong>
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {SUPPORTED_LANGUAGES.map(l => (
                    <button
                      key={l.code}
                      onClick={() => { onLangChange(l.code); setTgtLang(l.code); setOpen(false); }}
                      style={{
                        padding: "10px 12px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                        background: activeLang === l.code ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.04)",
                        border: `1px solid ${activeLang === l.code ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.07)"}`,
                        display: "flex", flexDirection: "column", gap: 2, transition: "all 0.15s",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 16 }}>{l.flag}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: activeLang === l.code ? "#a5b4fc" : "#f8fafc" }}>{l.name}</span>
                        {activeLang === l.code && <span style={{ marginLeft: "auto", fontSize: 10, color: "#10b981" }}>✓ Active</span>}
                      </div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>{l.native}</div>
                    </button>
                  ))}
                </div>
                <div style={{ marginTop: 14, padding: "10px 14px", background: "rgba(34,211,238,0.06)", border: "1px solid rgba(34,211,238,0.2)", borderRadius: 12, fontSize: 12, color: "#67e8f9" }}>
                  🎙️ Voice input and 🔊 text-to-speech will now use <strong>{activeLangName?.name}</strong>. Look for mic buttons in the complaint form.
                </div>
              </div>
            )}

            {/* Translator tab */}
            {tab === "translate" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {/* Language pair selector */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <select value={srcLang} onChange={e => setSrcLang(e.target.value)} className="input-field" style={{ flex: 1, padding: "6px 10px", fontSize: 12 }}>
                    {SUPPORTED_LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name} ({l.native})</option>)}
                  </select>
                  <button onClick={swap} style={{ flexShrink: 0, width: 36, height: 36, borderRadius: 10, background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1" }}>
                    <ArrowLeftRight size={16} />
                  </button>
                  <select value={tgtLang} onChange={e => setTgtLang(e.target.value)} className="input-field" style={{ flex: 1, padding: "6px 10px", fontSize: 12 }}>
                    {SUPPORTED_LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name} ({l.native})</option>)}
                  </select>
                </div>

                {/* Source text */}
                <div>
                  <textarea
                    className="input-field"
                    style={{ minHeight: 80, resize: "vertical", fontSize: 13 }}
                    placeholder="Type text to translate..."
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                  />
                </div>

                <button
                  onClick={handleTranslate}
                  disabled={!inputText.trim() || translating}
                  style={{ background: "linear-gradient(135deg,#6366f1,#22d3ee)", color: "white", border: "none", borderRadius: 12, padding: "10px", fontWeight: 700, cursor: "pointer", fontSize: 13, transition: "all 0.2s", opacity: translating ? 0.7 : 1 }}
                >
                  {translating ? "⏳ Translating..." : "🔀 Translate"}
                </button>

                {/* Output */}
                {outputText && (
                  <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 12, padding: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>
                        {SUPPORTED_LANGUAGES.find(l => l.code === tgtLang)?.name} Translation
                      </div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <TextToSpeech text={outputText} lang={tgtLang} size="sm" />
                        <button onClick={copy} style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: copied ? "#10b981" : "#94a3b8" }}>
                          {copied ? <Check size={12} /> : <Copy size={12} />}
                        </button>
                      </div>
                    </div>
                    <p style={{ fontSize: 14, lineHeight: 1.6, color: "#e2e8f0", margin: 0 }}>{outputText}</p>
                  </div>
                )}

                <p style={{ fontSize: 11, color: "#334155", textAlign: "center" }}>
                  Powered by MyMemory Translation API · Free · 10k chars/day
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
