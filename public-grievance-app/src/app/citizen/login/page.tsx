"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db } from "@/lib/store";
import { Eye, EyeOff, Mail, Lock, Shield, ArrowRight, CheckCircle } from "lucide-react";
import Logo from "@/components/Logo";

export default function CitizenLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    const user = db.loginUser(form.email, form.password);
    if (user) {
      if (typeof window !== "undefined") localStorage.setItem("currentUser", JSON.stringify(user));
      setSuccess(true);
      await new Promise(r => setTimeout(r, 700));
      router.push("/citizen/dashboard");
    } else {
      setError("Invalid credentials. Try: arjun@email.com / Arjun@123");
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setGoogleLoading(true);
    await new Promise(r => setTimeout(r, 1800));
    // Simulate Google OAuth — auto-login as demo user
    const user = db.loginUser("arjun@email.com", "Arjun@123");
    if (user) {
      if (typeof window !== "undefined") localStorage.setItem("currentUser", JSON.stringify(user));
      setSuccess(true);
      await new Promise(r => setTimeout(r, 700));
      router.push("/citizen/dashboard");
    }
    setGoogleLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      {/* Animated background orbs */}
      {[
        { w: 500, h: 500, top: "-15%", left: "-10%", color: "rgba(99,102,241,0.15)" },
        { w: 400, h: 400, bottom: "-10%", right: "-5%", color: "rgba(34,211,238,0.1)" },
        { w: 300, h: 300, top: "40%", left: "30%", color: "rgba(168,85,247,0.08)" },
      ].map((orb, i) => (
        <motion.div key={i}
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 6 + i * 2, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "fixed",
            width: orb.w,
            height: orb.h,
            borderRadius: "50%",
            background: orb.color,
            filter: "blur(80px)",
            zIndex: 0,
            top: (orb as any).top,
            left: (orb as any).left,
            bottom: (orb as any).bottom,
            right: (orb as any).right,
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Left hero panel */}
      <motion.div
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{
          width: "45%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 64px",
          position: "relative",
          zIndex: 1,
          background: "linear-gradient(160deg, rgba(99,102,241,0.12) 0%, rgba(34,211,238,0.06) 100%)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}>
        <div style={{ marginBottom: 60 }}>
          <Logo size={52} />
        </div>

        <h1 style={{
          fontSize: "clamp(32px, 4vw, 52px)",
          fontWeight: 900,
          color: "white",
          lineHeight: 1.1,
          marginBottom: 24,
          letterSpacing: "-0.03em",
          fontFamily: "'Space Grotesk', sans-serif",
        }}>
          Voice your<br />
          <span style={{
            background: "linear-gradient(135deg, #818cf8, #22d3ee)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>civic concerns</span>
        </h1>

        <p style={{
          fontSize: 17,
          color: "rgba(255,255,255,0.55)",
          lineHeight: 1.8,
          marginBottom: 56,
          fontWeight: 500,
          maxWidth: 380,
        }}>
          Join thousands of Bengalureans shaping a smarter, more responsive
          city through intelligent civic tech.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {[
            { icon: "🏛️", text: "Connected to 12 government departments" },
            { icon: "🔒", text: "Zero-knowledge identity protection" },
            { icon: "⚡", text: "AI-powered instant complaint routing" },
            { icon: "🪙", text: "Earn Civic Tokens for contributions" },
          ].map(({ icon, text }) => (
            <div key={text} style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, flexShrink: 0,
              }}>{icon}</div>
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>{text}</span>
            </div>
          ))}
        </div>

      </motion.div>

      {/* Right form panel */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 60px",
        position: "relative",
        zIndex: 1,
      }}>
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          style={{
            width: "100%",
            maxWidth: 440,
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(32px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 28,
            padding: "48px 44px",
            boxShadow: "0 32px 80px rgba(0,0,0,0.4)",
          }}>

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div key="success"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{ textAlign: "center", padding: "40px 0" }}>
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }}>
                  <CheckCircle size={64} color="#10b981" style={{ margin: "0 auto 20px", display: "block" }} />
                </motion.div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "white", marginBottom: 8 }}>Authenticated!</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>Redirecting to your dashboard...</div>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 1 }}>
                <div style={{ marginBottom: 36 }}>
                  <h2 style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: "white",
                    marginBottom: 8,
                    fontFamily: "'Space Grotesk', sans-serif",
                    letterSpacing: "-0.02em",
                  }}>Welcome back</h2>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>
                    Sign in to continue to your dashboard
                  </p>
                </div>

                {/* Demo credentials */}
                <div style={{
                  background: "rgba(99,102,241,0.12)",
                  border: "1px solid rgba(99,102,241,0.25)",
                  borderRadius: 14,
                  padding: "12px 16px",
                  marginBottom: 28,
                  fontSize: 12.5,
                  color: "#a5b4fc",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}>
                  <span style={{ fontSize: 16 }}>💡</span>
                  <span><strong>Demo:</strong> arjun@email.com &nbsp;/&nbsp; Arjun@123</span>
                </div>

                {/* Google Sign-In */}
                <motion.button
                  whileHover={{ scale: 1.02, background: "rgba(255,255,255,0.14)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading || loading}
                  style={{
                    width: "100%",
                    padding: "14px 20px",
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.15)",
                    background: "rgba(255,255,255,0.08)",
                    color: "white",
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                    marginBottom: 24,
                    transition: "all 0.2s",
                    backdropFilter: "blur(10px)",
                  }}>
                  {googleLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                        style={{
                          width: 20, height: 20,
                          border: "2.5px solid rgba(255,255,255,0.2)",
                          borderTopColor: "white",
                          borderRadius: "50%",
                        }} />
                      <span>Connecting to Google...</span>
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 48 48">
                        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,19.001,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                      </svg>
                      <span>Continue with Google</span>
                    </>
                  )}
                </motion.button>

                {/* Divider */}
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 700, letterSpacing: "0.08em" }}>OR CONTINUE WITH EMAIL</span>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
                </div>

                {/* Email & Password form */}
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ position: "relative" }}>
                    <Mail size={15} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)", zIndex: 1 }} />
                    <input
                      style={{
                        width: "100%", background: "rgba(255,255,255,0.07)",
                        border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14,
                        padding: "14px 16px 14px 44px", color: "white", fontSize: 14,
                        outline: "none", fontFamily: "inherit", boxSizing: "border-box",
                      }}
                      onFocus={e => (e.target.style.borderColor = "rgba(99,102,241,0.7)")}
                      onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
                      type="email" placeholder="Email address"
                      value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                  </div>

                  <div style={{ position: "relative" }}>
                    <Lock size={15} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)", zIndex: 1 }} />
                    <input
                      style={{
                        width: "100%", background: "rgba(255,255,255,0.07)",
                        border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14,
                        padding: "14px 44px 14px 44px", color: "white", fontSize: 14,
                        outline: "none", fontFamily: "inherit", boxSizing: "border-box",
                      }}
                      onFocus={e => (e.target.style.borderColor = "rgba(99,102,241,0.7)")}
                      onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
                      type={show ? "text" : "password"} placeholder="Password"
                      value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                    <button type="button" onClick={() => setShow(!show)}
                      style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", padding: 4 }}>
                      {show ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        style={{ padding: "12px 16px", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, color: "#fca5a5", fontSize: 13, fontWeight: 500 }}>
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button whileHover={{ scale: 1.02, boxShadow: "0 8px 30px rgba(99,102,241,0.5)" }} whileTap={{ scale: 0.98 }}
                    type="submit" disabled={loading || googleLoading}
                    style={{
                      width: "100%", padding: "15px", borderRadius: 14, border: "none",
                      background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                      color: "white", fontWeight: 700, fontSize: 15,
                      cursor: loading ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      boxShadow: "0 4px 20px rgba(99,102,241,0.4)", marginTop: 4,
                      opacity: loading || googleLoading ? 0.7 : 1,
                    }}>
                    {loading ? (
                      <>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                          style={{ width: 18, height: 18, border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%" }} />
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <><span>Sign In</span><ArrowRight size={18} /></>
                    )}
                  </motion.button>
                </form>

                <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: 0 }}>
                    Don&apos;t have an account?{" "}
                    <Link href="/citizen/register" style={{ color: "#818cf8", fontWeight: 700, textDecoration: "none" }}>Register free</Link>
                  </p>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: 0 }}>
                    Government official?{" "}
                    <Link href="/admin/login" style={{ color: "#22d3ee", fontWeight: 700, textDecoration: "none" }}>Admin Portal →</Link>
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.2)", fontSize: 11, marginTop: 4 }}>
                    <Shield size={11} /><span>SSL Encrypted · Zero-knowledge identity protection</span>
                  </div>
                  <Link href="/" style={{ color: "rgba(255,255,255,0.2)", fontSize: 12, textDecoration: "none" }}>← Back to Home</Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
