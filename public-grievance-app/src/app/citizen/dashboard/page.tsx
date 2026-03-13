"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db, type Complaint, type User, type Circular, type EmergencyContact } from "@/lib/store";
import { categorizeComplaint, getStatusColor, getPriorityColor, formatDate, CATEGORIES, calculateDistance } from "@/lib/utils";
import { Plus, MapPin, Upload, X, CheckCircle, AlertTriangle, Clock, TrendingUp, Award, LogOut, Bell, ChevronRight, Eye, ThumbsUp, Zap, MessageSquare, Send, FileText, ShieldAlert, PhoneCall, Gift, Star, MessageSquareQuote, Search } from "lucide-react";
import Logo from "@/components/Logo";
import ProfilePhotoUpload from "@/components/ProfilePhotoUpload";
import VoiceInput from "@/components/VoiceInput";
import TextToSpeech from "@/components/TextToSpeech";
import LanguagePanel from "@/components/LanguagePanel";
import HiddenEvidenceRecorder from "@/components/HiddenEvidenceRecorder";

const MapPicker = dynamic(() => import("@/components/MapPicker"), { ssr: false, loading: () => (
  <div style={{ height: 340, background: "rgba(15,23,42,0.6)", borderRadius: 14, border: "1px solid rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10 }}>
    <div style={{ fontSize: 32 }}>🗺️</div>
    <div style={{ color: "#64748b", fontSize: 13 }}>Loading interactive map...</div>
  </div>
) });

const StatusBadge = ({ status }: { status: string }) => {
  const colors: any = {
    PENDING: { bg: "#fff7ed", text: "#ea580c", border: "#ffedd5", label: "🟡 PENDING" },
    IN_PROGRESS: { bg: "#eff6ff", text: "#2563eb", border: "#dbeafe", label: "🔵 IN PROGRESS" },
    RESOLVED: { bg: "#f0fdf4", text: "#16a34a", border: "#dcfce7", label: "💚 RESOLVED" },
    ESCALATED: { bg: "#fef2f2", text: "#dc2626", border: "#fee2e2", label: "🔥 ESCALATED" }
  };
  const config = colors[status] || colors.PENDING;
  return (
    <span style={{ 
      backgroundColor: config.bg, 
      color: config.text, 
      padding: "6px 14px", 
      borderRadius: 12, 
      fontSize: 11, 
      fontWeight: 900, 
      border: `1px solid ${config.border}`,
      letterSpacing: "0.02em",
      display: "inline-flex",
      alignItems: "center"
    }}>
      {config.label}
    </span>
  );
};
function PriorityBadge({ priority }: { priority: string }) {
  return <span className={`badge ${getPriorityColor(priority)}`}>{priority}</span>;
}

function ComplaintCard({ c, user, onUpvote, onPressurize, onComment, lang }: { c: Complaint; user: User; onUpvote: (id: string) => void; onPressurize: (id: string) => void; onComment?: (id: string, text: string) => void; lang: string }) {
  const [expanded, setExpanded] = useState(false);
  const [newComment, setNewComment] = useState("");
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      whileHover={{ y: -4 }}
      className="glass-strong perspective-hover" 
      style={{ padding: 24, cursor: "pointer", border: "1px solid #e2e8f0", background: "white", borderRadius: 24, boxShadow: "0 10px 30px rgba(0,0,0,0.03)" }} 
      onClick={() => setExpanded(!expanded)}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            <StatusBadge status={c.status} />
            <PriorityBadge priority={c.priority} />
            <span style={{ fontSize: 11, color: "hsl(var(--text-dim))", background: "#f1f5f9", padding: "4px 10px", borderRadius: 8, fontWeight: 800 }}>#{c.ticketId}</span>
          </div>
          <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 8, color: "hsl(var(--text-dark))", fontFamily: "Space Grotesk", lineHeight: 1.2 }}>{c.title}</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 12, color: "hsl(var(--text-dim))", fontSize: 13, fontWeight: 600 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><MapPin size={14} color="hsl(var(--primary))" /> {c.location}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Clock size={14} color="hsl(var(--primary))" /> {formatDate(c.createdAt)}</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, flexShrink: 0 }}>
          <div className="gradient-text" style={{ fontSize: 18, fontWeight: 900, fontFamily: "Space Grotesk" }}>+{c.tokens} 🪙</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={e => { e.stopPropagation(); onUpvote(c.id); }} className="btn-premium btn-premium-secondary" style={{ padding: "8px 14px", fontSize: 12, borderRadius: 12, background: "white", border: "1px solid #e2e8f0", color: "hsl(var(--text-main))", fontWeight: 800 }} disabled={c.userId === user.id}>
              <ThumbsUp size={14} /> {c.upvotes}
            </button>
            <div className="glass" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", fontSize: 12, borderRadius: 12, color: "hsl(var(--text-dim))", background: "#f8fafc", border: "1px solid #e2e8f0", fontWeight: 800 }}>
              <MessageSquare size={14} /> {c.comments?.length || 0}
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
            <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid #f1f5f9" }}>
              <p style={{ color: "hsl(var(--text-main))", fontSize: 16, lineHeight: 1.7, marginBottom: 28, whiteSpace: "pre-wrap", fontWeight: 500 }}>{c.description}</p>
              
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 28 }}>
                <div className="glass" style={{ fontSize: 12, color: "hsl(var(--text-dim))", padding: "8px 16px", borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0", fontWeight: 700 }}>📁 {c.category}</div>
                <div className="glass" style={{ fontSize: 12, color: "hsl(var(--text-dim))", padding: "8px 16px", borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0", fontWeight: 700 }}>🏛️ {c.department}</div>
                <div className="glass" style={{ fontSize: 12, color: "hsl(var(--danger))", padding: "8px 16px", borderRadius: 12, border: "1px solid hsla(var(--danger), 0.2)", background: "hsla(var(--danger), 0.05)", fontWeight: 700 }}>⏰ Deadline: {formatDate(c.deadline)}</div>
                
                <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
                  {c.status !== "RESOLVED" && c.userId === user.id && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onPressurize(c.id); }}
                      className="btn-premium"
                      style={{ background: "white", border: "1px solid hsl(var(--danger))", color: "hsl(var(--danger))", padding: "10px 20px", borderRadius: 12, fontSize: 13, fontWeight: 800 }}
                    >
                      🚨 Pressurize
                    </button>
                  )}
                  <TextToSpeech text={`Complaint: ${c.title}. Status: ${c.status}. ${c.description}`} lang={lang} size="sm" label="Voice Overview" />
                </div>
              </div>

              {/* Status Timeline */}
              <div style={{ marginBottom: 32, padding: 32, borderRadius: 24, background: "hsla(var(--bg-obsidian), 0.02)", border: "1px solid hsla(var(--bg-obsidian), 0.05)" }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "hsl(var(--text-dim))", letterSpacing: "0.1em", marginBottom: 24 }}>IMMUTABLE BLOCKCHAIN TRACKING</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 32, paddingLeft: 16, borderLeft: "2px solid #e2e8f0" }}>
                  <div style={{ position: "relative" }}>
                    <div style={{ position: "absolute", left: -25, top: 4, width: 16, height: 16, borderRadius: "50%", background: "hsl(var(--primary))", border: "4px solid white", boxShadow: "0 0 0 1px hsl(var(--primary))" }}></div>
                    <div style={{ fontSize: 15, color: "hsl(var(--text-dark))", fontWeight: 800 }}>Record Created</div>
                    <div style={{ fontSize: 12, color: "hsl(var(--text-dim))" }}>{formatDate(c.createdAt)}</div>
                  </div>
                  {(c.status === "IN_PROGRESS" || c.status === "RESOLVED" || c.status === "ESCALATED") && (
                    <div style={{ position: "relative" }}>
                      <div style={{ position: "absolute", left: -25, top: 4, width: 16, height: 16, borderRadius: "50%", background: "hsl(var(--accent))", border: "4px solid white", boxShadow: "0 0 0 1px hsl(var(--accent))" }}></div>
                      <div style={{ fontSize: 15, color: "hsl(var(--text-dark))", fontWeight: 800 }}>Assigned to {c.department}</div>
                      <div style={{ fontSize: 12, color: "hsl(var(--text-dim))" }}>Technical team initiated procedures</div>
                    </div>
                  )}
                  {c.escalationCount > 0 && (
                    <div style={{ position: "relative" }}>
                      <div className="neon-pulse" style={{ position: "absolute", left: -25, top: 4, width: 16, height: 16, borderRadius: "50%", background: "hsl(var(--danger))", border: "4px solid white", boxShadow: "0 0 0 1px hsl(var(--danger))" }}></div>
                      <div style={{ fontSize: 15, color: "hsl(var(--danger))", fontWeight: 900 }}>Public Pressure Escalation ({c.escalationCount}x)</div>
                      <div style={{ fontSize: 12, color: "hsla(var(--danger), 0.8)" }}>Priority forced to CRITICAL</div>
                    </div>
                  )}
                  {c.status === "RESOLVED" && (
                    <div style={{ position: "relative" }}>
                      <div style={{ position: "absolute", left: -25, top: 4, width: 16, height: 16, borderRadius: "50%", background: "hsl(var(--success))", border: "4px solid white", boxShadow: "0 0 0 1px hsl(var(--success))" }}></div>
                      <div style={{ fontSize: 15, color: "hsl(var(--success))", fontWeight: 900 }}>Resolved & Closed ✅</div>
                      <div style={{ fontSize: 12, color: "hsl(var(--text-dim))", marginBottom: 12 }}>{formatDate(c.updatedAt)}</div>
                      <div className="glass" style={{ padding: "16px 20px", border: "1px solid hsla(var(--success), 0.2)", borderRadius: 16, fontSize: 14, color: "hsl(var(--text-main))", lineHeight: 1.6, background: "white" }}>
                        <strong style={{ color: "hsl(var(--success))" }}>Resolution Message:</strong> {c.resolution}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: 32, fontSize: 11, color: "#64748b", fontFamily: "'Space Mono', monospace", padding: "12px 16px", background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0", wordBreak: "break-all" }}>
                HASH: {c.blockchainHash}
              </div>

              {/* Premium Comments Section */}
              <div style={{ marginTop: 32 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "hsla(0,0%,100%,0.3)", letterSpacing: "0.1em", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                  <MessageSquare size={14} /> COMMUNITY DISCOURSE ({c.comments?.length || 0})
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24, maxHeight: 400, overflowY: "auto", paddingRight: 12 }}>
                  {c.comments?.length > 0 ? c.comments.map(cm => (
                    <div key={cm.id} className="glass" style={{ display: "flex", gap: 14, padding: 16, borderRadius: 16, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: "hsl(var(--primary))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0, color: "white" }}>{cm.userAvatar}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
                          <span style={{ fontSize: 14, fontWeight: 800, color: "hsl(var(--text-dark))" }}>{cm.userName} {cm.userId === c.userId && <span style={{ background: "hsla(var(--primary), 0.1)", color: "hsl(var(--primary))", padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 800 }}>AUTHOR</span>}</span>
                          <span style={{ fontSize: 11, color: "hsl(var(--text-dim))", fontWeight: 600 }}>{formatDate(cm.createdAt)}</span>
                        </div>
                        <div style={{ fontSize: 14, color: "hsl(var(--text-main))", lineHeight: 1.5, fontWeight: 500 }}>{cm.text}</div>
                      </div>
                    </div>
                  )) : (
                    <div style={{ textAlign: "center", padding: 40, color: "hsl(var(--text-dim))", fontSize: 14, fontWeight: 600 }}>No community updates yet.</div>
                  )}
                </div>

                {onComment && (
                  <div style={{ display: "flex", gap: 12 }} onClick={e => e.stopPropagation()}>
                    <input
                      className="input-field"
                      placeholder="Add to the conversation..."
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter" && newComment.trim()) {
                          onComment(c.id, newComment.trim());
                          setNewComment("");
                        }
                      }}
                      style={{ flex: 1, padding: "14px 20px", fontSize: 14, borderRadius: 14, border: "1px solid #e2e8f0", background: "white", color: "hsl(var(--text-dark))", outline: "none" }}
                    />
                    <button
                      onClick={() => {
                        if (newComment.trim()) {
                          onComment(c.id, newComment.trim());
                          setNewComment("");
                        }
                      }}
                      disabled={!newComment.trim()}
                      className="btn-premium btn-premium-primary"
                      style={{ width: 50, height: 50, borderRadius: 14, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <Send size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function NewComplaintModal({ user, activeLang, onClose, onSubmit }: { user: User; activeLang: string; onClose: () => void; onSubmit: (c: Complaint) => void }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ title: "", description: "", location: "Bengaluru, Karnataka", lat: 12.9716, lng: 77.5946, imagePreview: "" });
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [hiddenEvidenceUrl, setHiddenEvidenceUrl] = useState("");
  const [aiResult, setAiResult] = useState<{ category: string; department: string; priority: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleLocationChange = (lat: number, lng: number, address: string) => {
    setForm(f => ({ ...f, lat, lng, location: address }));
  };

  const analyzeWithAI = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    const result = categorizeComplaint(form.title + " " + form.description);
    setAiResult(result);
    setLoading(false);
    setStep(3);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => setForm(f => ({ ...f, imagePreview: ev.target?.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!aiResult) return;
    setLoading(true);
    setError(null);
    await new Promise(r => setTimeout(r, 2000));
    try {
      const c = db.addComplaint({
        userId: user.id, userName: user.name, userEmail: user.email,
        title: form.title, description: form.description,
        category: aiResult.category, department: aiResult.department,
        priority: aiResult.priority as any, status: "PENDING",
        location: form.location, lat: form.lat, lng: form.lng,
        imageUrl: form.imagePreview || undefined,
        ...(isAnonymous && { isAnonymous: true, hiddenEvidenceUrl })
      });
      setLoading(false);
      setDone(true);
      setTimeout(() => { onSubmit(c); onClose(); }, 2500);
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
      setStep(1); // Take them back to fix the content
    }
  };

  if (done) return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, backdropFilter: "blur(10px)" }}>
      <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="glass-strong" style={{ padding: 50, textAlign: "center", maxWidth: 400 }}>
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }}><div style={{ fontSize: 64 }}>🎉</div></motion.div>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 10, marginTop: 10 }}>Complaint Filed!</h2>
        <p style={{ color: "#64748b", marginBottom: 16, fontSize: 14 }}>Your complaint has been analyzed by AI and submitted to the blockchain. Rewards will be added shortly.</p>
        <div style={{ color: "#f59e0b", fontSize: 22, fontWeight: 800 }}>+{aiResult?.priority === "CRITICAL" ? 200 : aiResult?.priority === "HIGH" ? 150 : 100} 🪙 Civic Tokens Earned!</div>
      </motion.div>
    </div>
  );



  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, backdropFilter: "blur(12px)", padding: 16 }}>
      <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-strong" style={{ width: "100%", maxWidth: 640, maxHeight: "92vh", overflowY: "auto", padding: 40, position: "relative", background: "white", border: "1px solid #e2e8f0", color: "hsl(var(--text-main))", boxShadow: "0 20px 50px rgba(0,0,0,0.15)", borderRadius: 32 }}>
        <button onClick={onClose} style={{ position: "absolute", top: 24, right: 24, background: "hsla(var(--bg-obsidian), 0.05)", border: "none", color: "hsl(var(--text-dim))", cursor: "pointer", borderRadius: 12, padding: 8 }}><X size={20} /></button>
        <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8, color: "hsl(var(--text-dark))", fontFamily: "Space Grotesk" }}>Express Your Concern</h2>
        
        {error && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ marginBottom: 24, padding: "16px 20px", background: "hsla(var(--danger), 0.05)", border: "1px solid hsla(var(--danger), 0.2)", borderRadius: 16, color: "hsl(var(--danger))", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 12 }}>
            <ShieldAlert size={20} />
            <div>
              <div style={{ fontWeight: 900, fontSize: 11, letterSpacing: "0.05em", marginBottom: 2 }}>BLOCKCHAIN MODERATION ALERT</div>
              {error}
            </div>
          </motion.div>
        )}
        <div style={{ display: "flex", gap: 0, marginBottom: 32, background: "#f1f5f9", borderRadius: 16, padding: 6 }}>
          {["Context", "Evidence", "Analysis", "Finalize"].map((s, i) => (
            <div key={s} style={{ flex: 1, textAlign: "center", padding: "10px 4px", fontSize: 12, borderRadius: 12, fontWeight: 800, background: (i + 1) === step ? "white" : "transparent", color: (i + 1) === step ? "hsl(var(--primary))" : "hsl(var(--text-dim))", boxShadow: (i + 1) === step ? "0 4px 12px rgba(0,0,0,0.05)" : "none", transition: "all 0.2s" }}>{s}</div>
          ))}
        </div>
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Title field with mic */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <label style={{ fontSize: 12, color: "hsl(var(--text-dim))", fontWeight: 800, letterSpacing: "0.05em" }}>INCIDENT TITLE</label>
                <VoiceInput lang={activeLang} onTranscript={t => setForm(f => ({ ...f, title: f.title ? f.title + " " + t : t }))} size="sm" placeholder="Speak title..." />
              </div>
              <input className="input-field" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }} placeholder="e.g. Broken streetlight on 12th Cross" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            {/* Description field with mic */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <label style={{ fontSize: 12, color: "hsl(var(--text-dim))", fontWeight: 800, letterSpacing: "0.05em" }}>DETAILED DESCRIPTION</label>
                <VoiceInput lang={activeLang} onTranscript={t => setForm(f => ({ ...f, description: f.description ? f.description + " " + t : t }))} size="sm" placeholder="Speak description..." />
              </div>
              <textarea className="input-field" style={{ minHeight: 140, resize: "none", background: "#f8fafc", border: "1px solid #e2e8f0" }} placeholder="Describe the situation with specific details for faster AI processing..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <p style={{ fontSize: 12, color: "hsl(var(--text-dim))", background: "#f1f5f9", padding: "10px 16px", borderRadius: 10, fontWeight: 600 }}>💡 Tip: Use the microphone to record your thoughts in <strong>{activeLang.split("-")[0].toUpperCase()}</strong></p>

            {/* Anti-Corruption Toggle */}
            <div style={{ marginTop: 8, padding: 20, borderRadius: 20, border: "1px solid hsla(var(--danger), 0.2)", background: isAnonymous ? "hsla(var(--danger), 0.05)" : "#fef2f2", transition: "all 0.2s" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                <input type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} style={{ width: 18, height: 18, accentColor: "hsl(var(--danger))" }} />
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <ShieldAlert size={20} color="hsl(var(--danger))" />
                  <span style={{ fontSize: 14, fontWeight: 900, color: "hsl(var(--danger))" }}>Anonymous Corruption Reporting</span>
                </div>
              </label>
              {isAnonymous && (
                <div style={{ marginTop: 16, paddingLeft: 30 }}>
                  <p style={{ fontSize: 13, color: "hsl(var(--text-dim))", marginBottom: 16, lineHeight: 1.5, fontWeight: 500 }}>Your identity is protected by end-to-end encryption. This report bypasses local channels and reaches the <strong>Anti-Corruption Cell</strong>.</p>
                  <HiddenEvidenceRecorder onRecord={setHiddenEvidenceUrl} />
                </div>
              )}
            </div>

            <button className="btn-primary" style={{ position: "relative", zIndex: 1, marginTop: 4 }} onClick={() => setStep(2)} disabled={!form.title || !form.description}>
              <span style={{ position: "relative", zIndex: 1 }}>Next: Add Location →</span>
            </button>
          </div>
        )}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 13, color: "#94a3b8", marginBottom: 8, display: "block", fontWeight: 600 }}>📍 Pin Your Complaint Location on the Map</label>
              <p style={{ fontSize: 12, color: "#475569", marginBottom: 10 }}>Click anywhere on the map, drag the marker to fine-tune, or tap <strong style={{ color: "#a5b4fc" }}>Use My Live Location</strong> to auto-detect.</p>
              <MapPicker
                lat={form.lat}
                lng={form.lng}
                onLocationChange={handleLocationChange}
              />
              {form.location && (
                <div style={{ marginTop: 8, padding: "8px 12px", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 10, fontSize: 13, color: "#a5b4fc" }}>
                  📍 Selected: <strong>{form.location}</strong>
                </div>
              )}
            </div>
            <div>
              <label style={{ fontSize: 13, color: "#94a3b8", marginBottom: 8, display: "block" }}>📷 Upload Photo Evidence (Optional)</label>
              <div onClick={() => fileRef.current?.click()} style={{ border: "2px dashed rgba(99,102,241,0.3)", borderRadius: 12, padding: "20px", textAlign: "center", cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(99,102,241,0.6)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)")}>
                {form.imagePreview ? (
                  <img src={form.imagePreview} alt="preview" style={{ maxHeight: 100, borderRadius: 8, margin: "0 auto" }} />
                ) : (
                  <div><Upload size={28} style={{ margin: "0 auto", color: "#6366f1" }} /><p style={{ color: "#64748b", fontSize: 13, marginTop: 8 }}>Click to upload or drag & drop</p><p style={{ color: "#334155", fontSize: 11 }}>JPG, PNG, HEIC up to 10MB</p></div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageChange} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setStep(1)}>← Back</button>
              <button className="btn-primary" style={{ flex: 2, position: "relative", zIndex: 1 }} onClick={analyzeWithAI} disabled={loading}>
                <span style={{ position: "relative", zIndex: 1 }}>{loading ? "🤖 AI Analyzing..." : "Analyze with AI →"}</span>
              </button>
            </div>
          </div>
        )}
        {step === 3 && aiResult && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ padding: 20, background: "#ecfdf5", border: "1px solid #10b981", borderRadius: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, color: "#059669", fontWeight: 800 }}><Zap size={18} /> Verified AI Analysis</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ background: "white", borderRadius: 12, padding: 14, border: "1px solid #d1fae5" }}><div style={{ fontSize: 11, color: "hsl(var(--text-dim))", fontWeight: 800, marginBottom: 6 }}>CATEGORY</div><div style={{ fontSize: 14, fontWeight: 800 }}>{aiResult?.category}</div></div>
                <div style={{ background: "white", borderRadius: 12, padding: 14, border: "1px solid #d1fae5" }}><div style={{ fontSize: 11, color: "hsl(var(--text-dim))", fontWeight: 800, marginBottom: 6 }}>DEPARTMENT</div><div style={{ fontSize: 14, fontWeight: 800 }}>{aiResult?.department}</div></div>
                <div style={{ background: "white", borderRadius: 12, padding: 14, border: "1px solid #d1fae5" }}><div style={{ fontSize: 11, color: "hsl(var(--text-dim))", fontWeight: 800, marginBottom: 6 }}>PRIORITY</div><PriorityBadge priority={aiResult?.priority || "LOW"} /></div>
                <div style={{ background: "white", borderRadius: 12, padding: 14, border: "1px solid #d1fae5" }}><div style={{ fontSize: 11, color: "hsl(var(--text-dim))", fontWeight: 800, marginBottom: 6 }}>EST. TOKEN REWARD</div><div style={{ fontSize: 15, fontWeight: 900, color: "#f59e0b" }}>{aiResult?.priority === "CRITICAL" ? 200 : aiResult?.priority === "HIGH" ? 150 : 100} 🪙</div></div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: "hsl(var(--text-dim))", padding: "12px 16px", background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0", fontWeight: 500 }}>A SHA-256 blockchain hash will be generated for this report, making it immutable and tamper-proof on the Public Ledger.</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setStep(2)}>← Back</button>
              <button className="btn-primary" style={{ flex: 2, position: "relative", zIndex: 1 }} onClick={handleSubmit} disabled={loading}>
                <span style={{ position: "relative", zIndex: 1 }}>{loading ? "⛓️ Recording on Blockchain..." : "Submit Complaint →"}</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function CitizenDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [allComplaints, setAllComplaints] = useState<Complaint[]>([]);
  const [leaderboard, setLeaderboard] = useState<User[]>([]);
  const [circulars, setCirculars] = useState<Circular[]>([]);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"feed" | "nearby" | "complaints" | "leaderboard" | "stats" | "circulars" | "contacts" | "rewards" | "feedback">("feed");
  const [profilePhoto, setProfilePhoto] = useState<string>("");
  const [activeLang, setActiveLang] = useState("en-IN");
  const [redeemMessage, setRedeemMessage] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");
  const [nearbyRadius, setNearbyRadius] = useState<number>(5); // Default 5km
  const [userLocation, setUserLocation] = useState({ lat: 12.9716, lng: 77.5946 }); // Default Bengaluru Center

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("currentUser") : null;
    if (!stored) { router.push("/citizen/login"); return; }
    const u = JSON.parse(stored);
    db.loginUser(u.email, u.password);
    const freshUser = db.getCurrentUser() || u;
    setUser(freshUser);
    setComplaints(db.getComplaintsByUser(freshUser.id));
    setAllComplaints(db.getComplaints());
    setLeaderboard(db.getLeaderboard());
    setCirculars(db.getCirculars());
    setContacts(db.getContacts());
    const savedPhoto = localStorage.getItem(`profilePhoto_${u.email}`) || "";
    setProfilePhoto(savedPhoto);
  }, []);

  const handleUpvote = (id: string) => {
    db.upvoteComplaint(id);
    setComplaints(db.getComplaintsByUser(user!.id));
    setAllComplaints(db.getComplaints());
  };

  const handlePressurize = (id: string) => {
    db.pressurizeComplaint(id, user!.id);
    setComplaints(db.getComplaintsByUser(user!.id));
    setAllComplaints(db.getComplaints());
  };

  const handleComment = (id: string, text: string) => {
    db.addComment(id, user!.id, user!.name, text);
    setComplaints(db.getComplaintsByUser(user!.id));
    setAllComplaints(db.getComplaints());
  };

  const handleRedeem = (amount: number, rewardName: string) => {
    if (user && user.points >= amount) {
      const success = db.redeemTokens(user.id, amount);
      if (success) {
        setUser(db.getCurrentUser() || user);
        setRedeemMessage(`Successfully redeemed ${rewardName}! Code sent to ${user.email}`);
        setTimeout(() => setRedeemMessage(""), 5000);
      }
    } else {
      setRedeemMessage("Not enough tokens to redeem this reward.");
      setTimeout(() => setRedeemMessage(""), 3000);
    }
  };

  const handleLogout = () => {
    db.logout();
    if (typeof window !== "undefined") localStorage.removeItem("currentUser");
    router.push("/");
  };

  const handleNewComplaint = (c: Complaint) => {
    setComplaints(db.getComplaintsByUser(user!.id));
    const freshUser = db.getCurrentUser();
    if (freshUser) { setUser(freshUser); if (typeof window !== "undefined") localStorage.setItem("currentUser", JSON.stringify(freshUser)); }
  };

  if (!user) return <div style={{ minHeight: "100vh", background: "hsl(var(--bg-deep))", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ color: "hsl(var(--primary))", fontSize: 18, fontWeight: 800 }}>Loading Government Portal...</div></div>;

  const stats = db.getStats();

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", backgroundColor: "hsl(var(--bg-deep))", color: "hsl(var(--text-main))", fontFamily: "Inter, sans-serif" }}>
      {/* Premium Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 100, borderBottom: "1px solid hsla(var(--bg-obsidian), 0.1)", background: "hsla(var(--bg-obsidian), 0.95)", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "4px solid hsl(var(--primary))" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <Logo size={40} />
          <div className="glass" style={{ display: "flex", alignItems: "center", padding: "10px 24px", gap: 12, minWidth: 400, border: "1px solid hsla(0,0%,100%,0.1)", background: "hsla(0,0%,100%,0.05)", borderRadius: 12 }}>
            <Search size={18} color="hsla(0,0%,100%,0.4)" />
            <input placeholder="Search records, circulars, or incentives..." style={{ background: "transparent", border: "none", color: "white", outline: "none", fontSize: 14, width: "100%", fontWeight: 500 }} />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <LanguagePanel activeLang={activeLang} onLangChange={setActiveLang} />
          <div style={{ width: 1, height: 32, background: "hsla(0,0%,100%,0.1)" }}></div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 800, fontSize: 15, fontFamily: "Space Grotesk", color: "white" }}>{user.name}</div>
              <div style={{ fontSize: 10, color: "hsl(var(--primary))", fontWeight: 900, letterSpacing: "0.1em" }}>GOVT-VERIFIED ID</div>
            </div>
            <ProfilePhotoUpload 
              photo={profilePhoto}
              initials={user.avatar}
              gradient="linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))"
              size={48}
              onPhotoChange={(b64) => {
                setProfilePhoto(b64);
                localStorage.setItem(`profilePhoto_${user.email}`, b64);
              }}
            />
          </div>
          <button onClick={handleLogout} className="btn-premium btn-premium-secondary" style={{ padding: "10px 18px", borderRadius: 10, display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 900, background: "hsla(0,0%,100%,0.05)", border: "1px solid hsla(0,0%,100%,0.1)", color: "white" }}>
            <LogOut size={16} /> SIGN OUT
          </button>
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Modern Sidebar */}
        <aside style={{ width: 280, borderRight: "1px solid #e2e8f0", background: "white", display: "flex", flexDirection: "column", padding: "32px 20px", boxShadow: "10px 0 30px rgba(0,0,0,0.02)" }}>
          <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
            {[
              { key: "feed", icon: <TrendingUp size={20} />, label: "City Live Feed" },
              { key: "nearby", icon: <MapPin size={20} />, label: "Nearby Issues" },
              { key: "complaints", icon: <FileText size={20} />, label: "My Submissions" },
              { key: "rewards", icon: <Gift size={20} />, label: "Govt Incentives" },
              { key: "feedback", icon: <MessageSquareQuote size={20} />, label: "Dev Feedback" },
              { key: "circulars", icon: <Bell size={20} />, label: "Bulletins" },
              { key: "contacts", icon: <PhoneCall size={20} />, label: "Emergency Hub" },
              { key: "leaderboard", icon: <Award size={20} />, label: "City Ranking" },
            ].map(item => (
              <button 
                key={item.key} 
                onClick={() => setActiveTab(item.key as any)}
                style={{ 
                  width: "100%", 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 12, 
                  padding: "14px 18px", 
                  borderRadius: 14, 
                  border: "none", 
                  cursor: "pointer", 
                  background: activeTab === item.key ? "hsla(var(--primary), 0.1)" : "transparent",
                  color: activeTab === item.key ? "hsl(var(--primary))" : "hsl(var(--text-dim))",
                  fontWeight: activeTab === item.key ? 900 : 600,
                  fontSize: 14,
                  transition: "all 0.2s",
                  textAlign: "left"
                }}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </nav>

          <div style={{ marginTop: "auto", padding: 24, background: "#f8fafc", borderRadius: 20, border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "hsl(var(--success))", fontWeight: 900, fontSize: 24, marginBottom: 4, fontFamily: "Space Grotesk" }}>
              <Zap size={22} fill="currentColor" /> {user.points} 🪙
            </div>
            <div style={{ fontSize: 10, color: "hsl(var(--text-dim))", fontWeight: 800, letterSpacing: "0.05em" }}>CITIZEN TOKENS</div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main style={{ flex: 1, overflowY: "auto", padding: "48px 60px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 48 }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, fontFamily: "Space Grotesk", color: "hsl(var(--text-dark))" }}>
              Namaste, {user.name.split(" ")[0]}! 👋
            </h1>
            <p style={{ color: "hsl(var(--text-dim))", fontSize: 16, fontWeight: 600 }}>Track your civic contributions and stay informed.</p>
          </div>
          <button className="btn-premium btn-premium-primary" onClick={() => setShowModal(true)} style={{ padding: "14px 28px", borderRadius: 14, display: "flex", alignItems: "center", gap: 10, fontSize: 15, fontWeight: 800 }}>
            <Plus size={20} /> File New Complaint
          </button>
        </div>

        {/* Premium Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24, marginBottom: 48 }}>
          {[
            { label: "Submissions", value: user.complaintsCount, icon: <FileText size={24} />, color: "hsl(var(--primary))" },
            { label: "Resolutions", value: user.resolvedCount, icon: <CheckCircle size={24} />, color: "hsl(var(--success))" },
            { label: "Civic Tokens", value: user.points, icon: <Zap size={24} />, color: "#f59e0b" },
            { label: "Global Rank", value: `#${leaderboard.findIndex(u => u.email === user.email) + 1 || "—"}`, icon: <Award size={24} />, color: "hsl(var(--accent))" },
          ].map(s => (
            <motion.div 
              key={s.label} 
              whileHover={{ y: -6, scale: 1.02 }} 
              className="glass-strong perspective-hover" 
              style={{ padding: 28, borderRadius: 24, border: `1px solid #e2e8f0`, background: "white", boxShadow: "0 10px 25px rgba(0,0,0,0.03)" }}
            >
              <div style={{ color: s.color, marginBottom: 16 }}>{s.icon}</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: "hsl(var(--text-dark))", fontFamily: "Space Grotesk", marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "hsl(var(--text-dim))", fontWeight: 800, letterSpacing: "0.1em" }}>{s.label.toUpperCase()}</div>
            </motion.div>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "feed" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            <div style={{ background: "white", padding: 32, borderRadius: 32, border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <TrendingUp size={24} color="hsl(var(--primary))" />
                <h2 style={{ fontSize: 24, fontWeight: 900, color: "hsl(var(--text-dark))", fontFamily: "Space Grotesk" }}>Live City Feed</h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {allComplaints.map(c => <ComplaintCard key={c.id} c={c} user={user!} onUpvote={handleUpvote} onPressurize={handlePressurize} onComment={handleComment} lang={activeLang} />)}
              </div>
            </div>
          </div>
        )}

        {activeTab === "nearby" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
              <h2 style={{ fontSize: 28, fontWeight: 900, color: "hsl(var(--text-dark))", fontFamily: "Space Grotesk" }}>Issues Near You</h2>
              <div style={{ display: "flex", gap: 12 }}>
                {[
                  { label: "500m", value: 0.5 },
                  { label: "1km", value: 1 },
                  { label: "5km", value: 5 }
                ].map(f => (
                  <button 
                    key={f.label} 
                    onClick={() => setNearbyRadius(f.value)}
                    className="glass" 
                    style={{ 
                      padding: "10px 20px", 
                      borderRadius: 12, 
                      fontSize: 13, 
                      fontWeight: 800, 
                      background: nearbyRadius === f.value ? "hsl(var(--primary))" : "white", 
                      color: nearbyRadius === f.value ? "white" : "hsl(var(--text-dim))", 
                      border: "1px solid #e2e8f0",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              {allComplaints
                .filter(c => {
                  if (!c.lat || !c.lng) return false;
                  const dist = calculateDistance(userLocation.lat, userLocation.lng, c.lat, c.lng);
                  return dist <= nearbyRadius;
                })
                .sort((a, b) => {
                  const distA = calculateDistance(userLocation.lat, userLocation.lng, a.lat!, a.lng!);
                  const distB = calculateDistance(userLocation.lat, userLocation.lng, b.lat!, b.lng!);
                  return distA - distB;
                })
                .map(c => {
                  const dist = calculateDistance(userLocation.lat, userLocation.lng, c.lat!, c.lng!);
                  return (
                    <div key={c.id} style={{ position: "relative" }}>
                      <div style={{ position: "absolute", top: 12, right: 12, zIndex: 10, background: "hsla(var(--primary), 0.1)", color: "hsl(var(--primary))", padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 900, border: "1px solid hsla(var(--primary), 0.2)" }}>
                        {dist < 1 ? `${(dist * 1000).toFixed(0)}m away` : `${dist.toFixed(1)}km away`}
                      </div>
                      <ComplaintCard c={c} user={user!} onUpvote={handleUpvote} onPressurize={handlePressurize} onComment={handleComment} lang={activeLang} />
                    </div>
                  );
                })}
              {allComplaints.filter(c => {
                if (!c.lat || !c.lng) return false;
                return calculateDistance(userLocation.lat, userLocation.lng, c.lat, c.lng) <= nearbyRadius;
              }).length === 0 && (
                <div style={{ gridColumn: "span 2", textAlign: "center", padding: 60, background: "white", borderRadius: 32, border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>📍</div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: "hsl(var(--text-dark))" }}>No issues within {nearbyRadius < 1 ? `${nearbyRadius * 1000}m` : `${nearbyRadius}km`}</h3>
                  <p style={{ color: "hsl(var(--text-dim))", marginTop: 8 }}>Try expanding your search radius to see more reports.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "complaints" && (
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 32, color: "hsl(var(--text-dark))", fontFamily: "Space Grotesk" }}>Your Contribution History</h2>
            {allComplaints.filter(c => c.userId === user.id).length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {allComplaints.filter(c => c.userId === user.id).map(c => (
                  <ComplaintCard key={c.id} c={c} user={user!} onUpvote={handleUpvote} onPressurize={handlePressurize} onComment={handleComment} lang={activeLang} />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: 80, background: "white", borderRadius: 32, border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: 48, marginBottom: 24 }}>📜</div>
                <h3 style={{ fontSize: 24, fontWeight: 800, color: "hsl(var(--text-dark))", marginBottom: 12 }}>No records yet</h3>
                <p style={{ color: "hsl(var(--text-dim))", marginBottom: 32, fontWeight: 600 }}>Your civic journey starts with your first report.</p>
                <button className="btn-premium btn-premium-primary" onClick={() => setShowModal(true)} style={{ padding: "14px 28px" }}>File a Complaint</button>
              </div>
            )}
          </div>
        )}

        {activeTab === "circulars" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: "hsl(var(--text-dark))", fontFamily: "Space Grotesk" }}>Official Bulletins</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              {circulars.map(c => (
                <div key={c.id} className="glass-strong" style={{ padding: 32, borderRadius: 28, border: "1px solid #e2e8f0", background: "white", boxShadow: "0 10px 30px rgba(0,0,0,0.03)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                    <div style={{ fontSize: 10, fontWeight: 900, background: "hsla(var(--primary), 0.1)", color: "hsl(var(--primary))", padding: "6px 12px", borderRadius: 8 }}>GOVT NOTICE</div>
                    <div style={{ fontSize: 11, color: "hsl(var(--text-dim))", fontWeight: 700 }}>{formatDate(c.createdAt)}</div>
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 900, color: "hsl(var(--text-dark))", marginBottom: 12, fontFamily: "Space Grotesk" }}>{c.title}</h3>
                  <p style={{ color: "hsl(var(--text-main))", fontSize: 14, lineHeight: 1.6, marginBottom: 20, fontWeight: 500 }}>{c.content}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: "hsl(var(--text-dim))" }}>🏛️ {c.department}</span>
                    <button className="btn-premium" style={{ background: "white", border: "1px solid #e2e8f0", color: "hsl(var(--primary))", fontSize: 12, padding: "8px 16px", borderRadius: 10, fontWeight: 800 }}>Read More</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "contacts" && (
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 32, color: "hsl(var(--text-dark))", fontFamily: "Space Grotesk" }}>Emergency Response Hub</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
              {contacts.map(c => (
                <motion.div 
                  key={c.id} 
                  whileHover={{ scale: 1.02 }} 
                  className="glass-strong" 
                  style={{ padding: 32, borderRadius: 28, border: "1px solid #e2e8f0", background: "white", boxShadow: "0 10px 30px rgba(0,0,0,0.03)", textAlign: "center" }}
                >
                  <div style={{ width: 64, height: 64, borderRadius: 20, background: "hsla(var(--danger), 0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "hsl(var(--danger))" }}>
                    <PhoneCall size={32} />
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 900, color: "hsl(var(--text-dark))", marginBottom: 4, fontFamily: "Space Grotesk" }}>{c.title}</h3>
                  <div style={{ fontSize: 12, color: "hsl(var(--text-dim))", fontWeight: 700, marginBottom: 20 }}>{c.department}</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "hsl(var(--danger))", marginBottom: 24, fontFamily: "Space Grotesk" }}>{c.number}</div>
                  <button className="btn-premium" style={{ width: "100%", background: "hsl(var(--danger))", color: "white", padding: 14, borderRadius: 14, fontWeight: 900, border: "none" }}>CALL NOW</button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Developer Feedback Tab */}
        {activeTab === "feedback" && (
          <div className="glass" style={{ padding: 40, maxWidth: 600, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{ width: 64, height: 64, background: "rgba(99,102,241,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <MessageSquareQuote size={32} color="#6366f1" />
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: "#f8fafc", marginBottom: 8 }}>Help us Enhance the Platform</h2>
              <p style={{ color: "#94a3b8" }}>Your feedback directly reaches our dev team. Let us know about bugs, feature ideas, or UI improvements.</p>
            </div>

            {feedbackSuccess ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center", padding: "40px 0" }}>
                <CheckCircle size={48} color="#10b981" style={{ marginBottom: 16 }} />
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "#f8fafc", marginBottom: 8 }}>Thank You!</h3>
                <p style={{ color: "#94a3b8", marginBottom: 24 }}>Your feedback has been submitted successfully. We appreciate your contribution to making Bengaluru better.</p>
                <button 
                  onClick={() => setFeedbackSuccess(false)}
                  style={{ padding: "12px 24px", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 12, color: "#6366f1", fontWeight: 700, cursor: "pointer" }}
                >
                  Give more feedback
                </button>
              </motion.div>
            ) : (
              <form onSubmit={async (e) => {
                e.preventDefault();
                setFeedbackError("");
                const formData = new FormData(e.currentTarget);
                try {
                  db.addFeedback(
                    user!.id,
                    user!.name,
                    "CITIZEN",
                    Number(formData.get("rating")),
                    formData.get("comment") as string,
                    formData.get("category") as any
                  );
                  setFeedbackSuccess(true);
                } catch (e: any) {
                  setFeedbackError(e.message);
                }
              }} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {feedbackError && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ padding: "16px 20px", background: "hsla(var(--danger), 0.05)", border: "1px solid hsla(var(--danger), 0.2)", borderRadius: 16, color: "hsl(var(--danger))", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 12 }}>
                    <ShieldAlert size={20} />
                    {feedbackError}
                  </motion.div>
                )}
                <div>
                  <label style={{ display: "block", color: "#94a3b8", fontSize: 14, marginBottom: 8, fontWeight: 600 }}>HOW WAS YOUR EXPERIENCE?</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <label key={star} style={{ cursor: "pointer" }}>
                        <input type="radio" name="rating" value={star} style={{ display: "none" }} defaultChecked={star === 5} />
                        <Star size={32} fill={star <= 5 ? "currentColor" : "none"} style={{ color: star <= 5 ? "#f59e0b" : "#334155", opacity: 0.8 }} />
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", color: "#94a3b8", fontSize: 14, marginBottom: 8, fontWeight: 600 }}>CATEGORY</label>
                  <select name="category" required className="input" style={{ width: "100%", background: "rgba(15,23,42,0.6)" }}>
                    <option value="BUG">🪲 Report a Bug</option>
                    <option value="FEATURE">💡 Feature Request</option>
                    <option value="UI">🎨 UI / Aesthetic Suggestion</option>
                    <option value="OTHER">📁 Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", color: "#94a3b8", fontSize: 14, marginBottom: 8, fontWeight: 600 }}>YOUR FEEDBACK</label>
                  <textarea name="comment" required className="input" rows={4} placeholder="Tell us what you think..." style={{ width: "100%", background: "rgba(15,23,42,0.6)", resize: "none" }}></textarea>
                </div>

                <button type="submit" style={{ padding: 16, background: "linear-gradient(135deg,#6366f1,#4f46e5)", border: "none", borderRadius: 12, color: "white", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <Send size={20} /> Submit Feedback
                </button>
              </form>
            )}
          </div>
        )}

        {activeTab === "rewards" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 40 }}>
              <div>
                <h2 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, color: "hsl(var(--text-dark))", fontFamily: "Space Grotesk" }}>Redeem Civic Tokens</h2>
                <p style={{ color: "hsl(var(--text-dim))", fontWeight: 600 }}>Convert your contributions into official government benefits and subsidies.</p>
              </div>
              <div className="glass-strong" style={{ padding: "20px 32px", borderRadius: 24, background: "white", border: "1px solid #e2e8f0", textAlign: "right", boxShadow: "0 10px 25px rgba(0,0,0,0.02)" }}>
                <div style={{ fontSize: 11, color: "hsl(var(--text-dim))", fontWeight: 900, letterSpacing: "0.1em", marginBottom: 4 }}>CURRENT BALANCE</div>
                <div style={{ fontSize: 36, fontWeight: 900, color: "hsl(var(--success))", fontFamily: "Space Grotesk" }}>{user.points} 🪙</div>
              </div>
            </div>

            {redeemMessage && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ background: redeemMessage.includes("Successfully") ? "#f0fdf4" : "#fef2f2", border: `1px solid ${redeemMessage.includes("Successfully") ? "#dcfce7" : "#fee2e2"}`, color: redeemMessage.includes("Successfully") ? "#16a34a" : "#dc2626", padding: "16px 24px", borderRadius: 16, marginBottom: 32, fontWeight: 700, display: "flex", alignItems: "center", gap: 12 }}>
                {redeemMessage.includes("Successfully") ? <CheckCircle size={20} /> : <AlertTriangle size={20} />} {redeemMessage}
              </motion.div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 32 }}>
              {[
                { title: "Namma Metro Value Pass", subtitle: "Free rides on any metro line", points: 500, emoji: "🚇", color: "#8b5cf6" },
                { title: "Property Tax Subsidy", subtitle: "Direct rebate on next bill", points: 5000, emoji: "🏠", color: "#10b981" },
                { title: "Bescom Power Voucher", subtitle: "Pay utility bills via tokens", points: 1000, emoji: "⚡", color: "#f59e0b" },
                { title: "Park Membership (Annual)", subtitle: "Pass for all city gardens", points: 800, emoji: "🌳", color: "#3b82f6" },
              ].map(reward => (
                <div key={reward.title} className="glass-strong" style={{ padding: 40, display: "flex", gap: 24, borderRadius: 32, border: "1px solid #e2e8f0", background: "white", boxShadow: "0 20px 40px rgba(0,0,0,0.03)", position: "relative", overflow: "hidden" }}>
                  <div style={{ width: 80, height: 80, borderRadius: 24, background: `${reward.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, flexShrink: 0 }}>{reward.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 20, fontWeight: 900, margin: "0 0 8px", color: "hsl(var(--text-dark))", fontFamily: "Space Grotesk" }}>{reward.title}</h3>
                    <p style={{ fontSize: 14, color: "hsl(var(--text-dim))", marginBottom: 24, fontWeight: 500 }}>{reward.subtitle}</p>
                    <button 
                      onClick={() => handleRedeem(reward.points, reward.title)}
                      disabled={user.points < reward.points}
                      className={`btn-premium ${user.points >= reward.points ? "btn-premium-primary" : ""}`}
                      style={{ padding: "14px 28px", borderRadius: 14, fontWeight: 900, width: "100%", background: user.points >= reward.points ? undefined : "#f1f5f9", color: user.points >= reward.points ? undefined : "#94a3b8", border: user.points >= reward.points ? undefined : "1px solid #e2e8f0" }}
                    >
                      {user.points >= reward.points ? `Redeem for ${reward.points} 🪙` : `Insufficent Tokens (Need ${reward.points - user.points} 🪙)`}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "leaderboard" && (
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 32, color: "hsl(var(--text-dark))", fontFamily: "Space Grotesk" }}>Honorary Citizens</h2>
            <div className="glass-strong" style={{ background: "white", borderRadius: 32, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.03)" }}>
              <div style={{ padding: "32px 40px", borderBottom: "1px solid #f1f5f9", display: "grid", gridTemplateColumns: "80px 1fr 140px 140px", fontSize: 12, fontWeight: 900, color: "hsl(var(--text-dim))", letterSpacing: "0.1em" }}>
                <div>RANK</div>
                <div>CITIZEN</div>
                <div style={{ textAlign: "right" }}>RESOLUTIONS</div>
                <div style={{ textAlign: "right" }}>TOKENS</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {leaderboard.sort((a,b) => b.points - a.points).map((u, i) => (
                  <div key={u.email} style={{ padding: "24px 40px", display: "grid", gridTemplateColumns: "80px 1fr 140px 140px", alignItems: "center", borderBottom: i < leaderboard.length - 1 ? "1px solid #f1f5f9" : "none", background: u.email === user.email ? "hsla(var(--primary), 0.05)" : "transparent" }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: i === 0 ? "#f59e0b" : i === 1 ? "#94a3b8" : i === 2 ? "#b45309" : "hsl(var(--text-dim))" }}>#{i + 1}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: "hsl(var(--primary))", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 900, fontSize: 16 }}>{u.avatar}</div>
                      <div>
                        <div style={{ fontWeight: 800, color: "hsl(var(--text-dark))", fontSize: 16 }}>{u.name} {u.email === user.email && <span style={{ fontSize: 10, background: "hsl(var(--primary))", color: "white", padding: "4px 10px", borderRadius: 8, marginLeft: 8 }}>YOU</span>}</div>
                        <div style={{ fontSize: 12, color: "hsl(var(--text-dim))", fontWeight: 600 }}>Verified Contributor</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right", fontWeight: 800, fontSize: 18, color: "hsl(var(--text-dark))" }}>{u.resolvedCount}</div>
                    <div style={{ textAlign: "right", fontWeight: 900, fontSize: 20, color: "hsl(var(--success))", fontFamily: "Space Grotesk" }}>{u.points}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "stats" && (
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 32, color: "hsl(var(--text-dark))", fontFamily: "Space Grotesk" }}>Public Administration Metrics</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24, marginBottom: 40 }}>
              {[
                { label: "Total Records", value: stats.total, icon: "🏛️", color: "hsl(var(--primary))" },
                { label: "Resolved", value: stats.resolved, icon: "✅", color: "hsl(var(--success))" },
                { label: "Open Issues", value: stats.pending + stats.inProgress, icon: "⏳", color: "#f59e0b" },
                { label: "Critical Priority", value: stats.critical, icon: "🚨", color: "hsl(var(--danger))" },
              ].map(s => (
                <div key={s.label} className="glass-strong" style={{ padding: 24, borderRadius: 24, background: "white", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: 24, marginBottom: 12 }}>{s.icon}</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: "hsl(var(--text-dark))", fontFamily: "Space Grotesk" }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: "hsl(var(--text-dim))", fontWeight: 800 }}>{s.label.toUpperCase()}</div>
                </div>
              ))}
            </div>
            <div className="glass-strong" style={{ padding: 40, background: "white", borderRadius: 32, border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h3 style={{ fontSize: 20, fontWeight: 900, color: "hsl(var(--text-dark))" }}>Governance Transparency Index</h3>
                <div style={{ fontSize: 24, fontWeight: 900, color: "hsl(var(--success))" }}>{Math.round(stats.resolved / stats.total * 100)}%</div>
              </div>
              <div style={{ height: 12, background: "#f1f5f9", borderRadius: 6, overflow: "hidden", marginBottom: 24 }}>
                <div style={{ width: `${Math.round(stats.resolved / stats.total * 100)}%`, height: "100%", background: "hsl(var(--success))" }}></div>
              </div>
              <p style={{ color: "hsl(var(--text-dim))", fontSize: 14, fontWeight: 500, lineHeight: 1.6 }}>Public Ledger Verification: All administrative actions are timestamped and signed using government-grade asymmetric encryption. 🔒</p>
            </div>
          </div>
        )}
        </main>
      </div>

      {showModal && <NewComplaintModal user={user!} activeLang={activeLang} onClose={() => setShowModal(false)} onSubmit={handleNewComplaint} />}
    </div>
  );
}
