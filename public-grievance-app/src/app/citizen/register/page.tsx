"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db } from "@/lib/store";
import { Eye, EyeOff, User, Mail, Phone, Lock, Shield, CheckCircle, ArrowRight } from "lucide-react";
import Logo from "@/components/Logo";

export default function CitizenRegister() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  const passwordStrength = (p: string) => {
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[@#$%!]/.test(p)) score++;
    return score;
  };
  const strength = passwordStrength(form.password);
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["", "#ef4444", "#fbbf24", "#34d399", "#10b981"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("Passwords don't match"); return; }
    if (strength < 2) { setError("Password is too weak. Use capital letters, numbers & symbols."); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    const user = db.registerUser(form.name, form.email, form.phone, form.password);
    if (typeof window !== "undefined") localStorage.setItem("currentUser", JSON.stringify(user));
    setLoading(false);
    setStep(2);
    setTimeout(() => router.push("/citizen/dashboard"), 2000);
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
      position: "relative", overflow: "hidden", fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>
      {/* Animated background orbs */}
      {[
        { w: 500, h: 500, top: "-10%", left: "-15%", color: "rgba(99,102,241,0.12)" },
        { w: 400, h: 400, bottom: "-5%", right: "-10%", color: "rgba(34,211,238,0.08)" },
      ].map((orb, i) => (
        <motion.div key={i}
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 8 + i * 2, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "fixed", width: orb.w, height: orb.h, borderRadius: "50%",
            background: orb.color, filter: "blur(90px)", zIndex: 0,
            top: (orb as any).top, left: (orb as any).left,
            bottom: (orb as any).bottom, right: (orb as any).right,
            pointerEvents: "none"
          }}
        />
      ))}

      {/* Left hero panel */}
      <motion.div initial={{ x: -60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.8 }}
        style={{
          width: "40%", display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "60px 80px", position: "relative", zIndex: 1,
          background: "rgba(255,255,255,0.02)",
          borderRight: "1px solid rgba(255,255,255,0.05)"
        }}>
        <div style={{ marginBottom: 60 }}>
          <Logo size={48} />
        </div>
        <h1 style={{ fontSize: 44, fontWeight: 900, color: "white", lineHeight: 1.1, marginBottom: 24, letterSpacing: "-0.02em", fontFamily: "'Space Grotesk', sans-serif" }}>
          Start your<br /><span style={{ color: "#818cf8" }}>civic journey</span>
        </h1>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: 48, maxWidth: 320 }}>
          Create an account to track issues, earn rewards, and stay connected with your local government.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {[
            { label: "Verified Citizens", val: "125k+" },
            { label: "Issues Resolved", val: "84k+" },
            { label: "Active Areas", val: "1.2k+" },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 28, fontWeight: 900, color: "white", fontFamily: "'Space Grotesk'" }}>{s.val}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontWeight: 700, letterSpacing: "0.1em" }}>{s.label.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Right form panel */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px", position: "relative", zIndex: 1 }}>
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div key="form" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
              style={{
                width: "100%", maxWidth: 480, background: "rgba(255,255,255,0.03)",
                backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 24, padding: "48px", boxShadow: "0 24px 60px rgba(0,0,0,0.3)"
              }}>
              <div style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 26, fontWeight: 800, color: "white", marginBottom: 6, fontFamily: "'Space Grotesk'" }}>Create Account</h2>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>Join the digital transformation of Bengaluru</p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ position: "relative" }}>
                  <User size={15} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" }} />
                  <input style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "14px 16px 14px 44px", color: "white", fontSize: 14, outline: "none", boxSizing: "border-box" }} placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div style={{ position: "relative" }}>
                  <Mail size={15} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" }} />
                  <input style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "14px 16px 14px 44px", color: "white", fontSize: 14, outline: "none", boxSizing: "border-box" }} type="email" placeholder="Email Address" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div style={{ position: "relative" }}>
                  <Phone size={15} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" }} />
                  <input style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "14px 16px 14px 44px", color: "white", fontSize: 14, outline: "none", boxSizing: "border-box" }} type="tel" placeholder="Phone Number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
                </div>
                <div style={{ position: "relative" }}>
                  <Lock size={15} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" }} />
                  <input style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "14px 44px 14px 44px", color: "white", fontSize: 14, outline: "none", boxSizing: "border-box" }} type={show ? "text" : "password"} placeholder="Set Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                  <button type="button" onClick={() => setShow(!show)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer" }}>{show ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                </div>

                {form.password && (
                  <div>
                    <div style={{ display: "flex", gap: 3, marginBottom: 6 }}>
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{ flex: 1, height: 2, borderRadius: 2, background: i <= strength ? strengthColors[strength] : "rgba(255,255,255,0.1)" }} />
                      ))}
                    </div>
                    <div style={{ fontSize: 11, color: strengthColors[strength], fontWeight: 700 }}>Security Score: {strengthLabels[strength]}</div>
                  </div>
                )}

                <div style={{ position: "relative" }}>
                  <Lock size={15} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" }} />
                  <input style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "14px 16px 14px 44px", color: "white", fontSize: 14, outline: "none", boxSizing: "border-box" }} type="password" placeholder="Confirm Password" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} required />
                </div>

                {error && <div style={{ padding: "12px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, color: "#fca5a5", fontSize: 13 }}>{error}</div>}

                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit" disabled={loading}
                  style={{
                    width: "100%", padding: "16px", borderRadius: 12, border: "none",
                    background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "white",
                    fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex",
                    alignItems: "center", justifyContent: "center", gap: 10, marginTop: 10,
                    boxShadow: "0 10px 25px rgba(99,102,241,0.3)"
                  }}>
                  {loading ? "Creating Account..." : <>Create Account <ArrowRight size={18} /></>}
                </motion.button>
              </form>

              <div style={{ marginTop: 24, textAlign: "center" }}>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>Already have an account? <Link href="/citizen/login" style={{ color: "#818cf8", fontWeight: 700 }}>Sign In</Link></p>
                <div style={{ marginTop: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "rgba(255,255,255,0.2)", fontSize: 11 }}>
                  <Shield size={11} /><span>Secured with AES-256 encryption & identity protection</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="success" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              style={{ padding: 60, textAlign: "center", maxWidth: 400, background: "rgba(255,255,255,0.05)", borderRadius: 30, border: "1px solid rgba(255,255,255,0.1)" }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.5 }}><CheckCircle size={64} color="#10b981" style={{ margin: "0 auto 20px" }} /></motion.div>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: "white", marginBottom: 12 }}>Welcome aboard! 🎉</h2>
              <p style={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>Your account has been created. Redirecting to your dashboard...</p>
              <div style={{ marginTop: 32, height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 99, overflow: "hidden" }}>
                <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1.8 }} style={{ height: "100%", background: "linear-gradient(90deg,#6366f1,#22d3ee)", borderRadius: 99 }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
