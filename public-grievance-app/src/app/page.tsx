"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Shield, Zap, MapPin, Award, TrendingUp, ChevronRight, Cpu, GitBranch, ChevronLeft } from "lucide-react";
import Logo from "@/components/Logo";

// ─── Government Schemes Data ───────────────────────────────────────────────
const SCHEMES = [
  {
    id: 1,
    title: "Pradhan Mantri Awas Yojana",
    subtitle: "Housing For All · Urban & Rural",
    description: "Affordable housing for every Indian family. PM Awas Yojana provides financial assistance ensuring 'Har Ghar Pucca Ghar' — a permanent, dignified home for all citizens by 2026.",
    tagline: "🏠 2.67 Crore Houses Sanctioned",
    image: "/scheme_pm_awas.png",
    accent: "#f97316",
    badge: "HOUSING",
    stats: [{ label: "Houses Built", value: "2.67 Cr" }, { label: "States Covered", value: "36" }, { label: "Budget", value: "₹79,590 Cr" }],
  },
  {
    id: 2,
    title: "Digital India Mission",
    subtitle: "Transforming India Digitally",
    description: "Making India a digitally empowered society and knowledge economy. High-speed internet, digital literacy, e-governance, and 1,000+ e-services for every citizen at their fingertips.",
    tagline: "💻 100 Cr+ Citizens Benefited",
    image: "/scheme_digital_india.png",
    accent: "#2563eb",
    badge: "TECHNOLOGY",
    stats: [{ label: "e-Services", value: "1,000+" }, { label: "CSC Centers", value: "5.16 L" }, { label: "States", value: "All 28" }],
  },
  {
    id: 3,
    title: "Swachh Bharat Mission",
    subtitle: "Clean India · Green India",
    description: "Eliminating open defecation and ensuring solid waste management across India. Creating a cleaner, healthier India for future generations with 11.48 crore toilets built.",
    tagline: "🧹 100% Open Defecation Free Villages",
    image: "/scheme_swachh_bharat.png",
    accent: "#16a34a",
    badge: "SANITATION",
    stats: [{ label: "Toilets Built", value: "11.48 Cr" }, { label: "ODF Villages", value: "6.36 L" }, { label: "Waste Plants", value: "3,000+" }],
  },
  {
    id: 4,
    title: "Skill India Mission",
    subtitle: "Empowering Youth · Building Nation",
    description: "Skilling millions of Indians to boost employability and entrepreneurship. Training youth across 30+ trades in manufacturing, service, and agriculture sectors.",
    tagline: "🎓 1.4 Crore Youth Trained Per Year",
    image: "/scheme_skill_india.png",
    accent: "#7c3aed",
    badge: "SKILL & JOBS",
    stats: [{ label: "Trained", value: "1.4 Cr/yr" }, { label: "Trades", value: "30+" }, { label: "Institutes", value: "15,000+" }],
  },
  {
    id: 5,
    title: "Smart Cities Mission",
    subtitle: "Building Tomorrow's India Today",
    description: "Developing 100 smart cities with smart infrastructure, clean energy, integrated command centers, and citizen-centric e-governance. Bengaluru is a proud Smart City champion.",
    tagline: "🏙️ 100 Cities · 7,500+ Smart Projects",
    image: "/scheme_smart_cities.png",
    accent: "#0284c7",
    badge: "URBAN DEV",
    stats: [{ label: "Cities", value: "100" }, { label: "Projects", value: "7,500+" }, { label: "Invested", value: "₹1.8 L Cr" }],
  },
];

const SITE_STATS = [
  { label: "Complaints Filed", value: "12,847", icon: "📋", color: "hsl(239, 84%, 67%)" },
  { label: "Issues Resolved", value: "9,234", icon: "✅", color: "hsl(158, 64%, 52%)" },
  { label: "Civic Tokens Issued", value: "48,200", icon: "🪙", color: "hsl(38, 92%, 50%)" },
  { label: "Departments Connected", value: "12", icon: "🏛️", color: "hsl(189, 94%, 43%)" },
];

const features = [
  { icon: <Cpu size={28} />, title: "AI Smart Categorization", desc: "NLP engine instantly categorizes and routes complaints to the right government department — no manual sorting needed.", color: "hsl(239, 84%, 67%)" },
  { icon: <GitBranch size={28} />, title: "Tamper-Proof Ledger", desc: "Every complaint gets a unique SHA-256 digital signature. Nobody can alter your complaint — ever.", color: "hsl(263, 70%, 50%)" },
  { icon: <MapPin size={28} />, title: "GPS Precision Reporting", desc: "Point on an interactive map to pinpoint issues. Location-tagged complaints for faster field response.", color: "hsl(189, 94%, 43%)" },
  { icon: <Shield size={28} />, title: "Identity Privacy", desc: "Your personal identity is protected. Anonymous reporting options available while still maintaining accountability.", color: "hsl(142, 70%, 45%)" },
  { icon: <Award size={28} />, title: "Civic Reward Tokens", desc: "Earn ERC-20 reward tokens for every complaint filed. Top reporters get weekly social media shoutouts!", color: "hsl(38, 92%, 50%)" },
  { icon: <TrendingUp size={28} />, title: "Auto-Escalation Engine", desc: "Unresolved issues auto-escalate to higher authorities. Officials face real ACR/salary consequences for delays.", color: "hsl(0, 84%, 60%)" },
];

const weeklyHeroes = [
  { name: "Arjun Kumar", pts: 850, complaints: 12, avatar: "AK", badge: "🥇" },
  { name: "Priya Sharma", pts: 720, complaints: 9, avatar: "PS", badge: "🥈" },
  { name: "Rahul Nair", pts: 540, complaints: 7, avatar: "RN", badge: "🥉" },
];

const floatingOrbs = [
  { size: 600, top: "-10%", left: "-10%", color: "hsla(239, 84%, 67%, 0.1)", delay: 0 },
  { size: 400, top: "40%", right: "-10%", color: "hsla(189, 94%, 43%, 0.08)", delay: 2 },
  { size: 500, bottom: "-10%", left: "20%", color: "hsla(263, 70%, 50%, 0.1)", delay: 4 },
];

// ─── Schemes Carousel ──────────────────────────────────────────────────────
function SchemesCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const timerRef = useRef<any>(null);

  const next = () => { setDirection(1); setCurrent(p => (p + 1) % SCHEMES.length); };
  const prev = () => { setDirection(-1); setCurrent(p => (p - 1 + SCHEMES.length) % SCHEMES.length); };
  const go = (idx: number) => { setDirection(idx > current ? 1 : -1); setCurrent(idx); };

  useEffect(() => {
    timerRef.current = setInterval(next, 5500);
    return () => clearInterval(timerRef.current);
  }, []);

  const s = SCHEMES[current];

  return (
    <section style={{ position: "relative", zIndex: 1, width: "100%", overflow: "hidden" }}>
      {/* News Ticker */}
      <div style={{ background: "linear-gradient(90deg, #1e3a8a, #1d4ed8, #0ea5e9)", padding: "10px 0", overflow: "hidden", whiteSpace: "nowrap" }}>
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          style={{ display: "inline-flex", gap: 60, fontSize: 13, fontWeight: 700, color: "white", letterSpacing: "0.05em", width: "200%" }}
        >
          {[
            "🏠 PM Awas Yojana — 2.67 Cr Houses Sanctioned",
            "💻 Digital India — 1,000+ e-Services Live",
            "🧹 Swachh Bharat — 100% ODF Villages Achieved",
            "🎓 Skill India — 1.4 Cr Youth Trained Per Year",
            "🏙️ Smart Cities — 100 Cities Transformed",
            "🌾 PM Kisan — ₹6,000/yr Direct Benefit Transfer",
            "💊 Ayushman Bharat — ₹5 Lakh Health Cover",
            "⚡ PM-KUSUM — Solar Power for Farmers",
            "🏠 PM Awas Yojana — 2.67 Cr Houses Sanctioned",
            "💻 Digital India — 1,000+ e-Services Live",
            "🧹 Swachh Bharat — 100% ODF Villages Achieved",
            "🎓 Skill India — 1.4 Cr Youth Trained Per Year",
            "🏙️ Smart Cities — 100 Cities Transformed",
            "🌾 PM Kisan — ₹6,000/yr Direct Benefit Transfer",
            "💊 Ayushman Bharat — ₹5 Lakh Health Cover",
            "⚡ PM-KUSUM — Solar Power for Farmers",
          ].map((t, i) => (
            <span key={i}>{t} &nbsp;•&nbsp;</span>
          ))}
        </motion.div>
      </div>

      {/* Main Slide */}
      <div style={{ position: "relative", height: 520, background: "#0f172a" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: direction * 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * 80 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            style={{ position: "absolute", inset: 0 }}
          >
            <img src={s.image} alt={s.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.42 }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(15,23,42,0.97) 0%, rgba(15,23,42,0.7) 50%, rgba(15,23,42,0.25) 100%)" }} />
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 6, background: s.accent }} />

            <div style={{ position: "relative", height: "100%", display: "flex", alignItems: "center", padding: "0 80px", maxWidth: 1300, margin: "0 auto" }}>
              <div style={{ flex: 1 }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${s.accent}22`, border: `1px solid ${s.accent}55`, borderRadius: 999, padding: "6px 18px", marginBottom: 20 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.accent, display: "inline-block" }} />
                  <span style={{ fontSize: 11, fontWeight: 900, color: s.accent, letterSpacing: "0.15em" }}>GOVT. SCHEME · {s.badge}</span>
                </motion.div>

                <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  style={{ fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 900, color: "white", lineHeight: 1.1, marginBottom: 8, letterSpacing: "-0.02em", fontFamily: "Space Grotesk, sans-serif" }}>
                  {s.title}
                </motion.h2>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
                  style={{ fontSize: 15, color: s.accent, fontWeight: 700, marginBottom: 24 }}>
                  {s.subtitle}
                </motion.div>
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  style={{ fontSize: 16, color: "rgba(255,255,255,0.72)", lineHeight: 1.75, marginBottom: 32, maxWidth: 600, fontWeight: 500 }}>
                  {s.description}
                </motion.p>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
                  style={{ fontSize: 14, fontWeight: 800, color: "white", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "10px 20px", display: "inline-block", marginBottom: 36 }}>
                  {s.tagline}
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                  style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
                  {s.stats.map(st => (
                    <div key={st.label}>
                      <div style={{ fontSize: 26, fontWeight: 900, color: s.accent, fontFamily: "Space Grotesk, sans-serif", lineHeight: 1 }}>{st.value}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 700, marginTop: 4, letterSpacing: "0.05em" }}>{st.label.toUpperCase()}</div>
                    </div>
                  ))}
                </motion.div>
              </div>
              <div style={{ flexShrink: 0, textAlign: "right", paddingLeft: 40 }}>
                <div style={{ fontSize: 80, fontWeight: 900, color: "rgba(255,255,255,0.04)", fontFamily: "Space Grotesk", lineHeight: 1 }}>0{current + 1}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", fontWeight: 700, marginTop: -20 }}>/ 0{SCHEMES.length}</div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <button onClick={prev} style={{ position: "absolute", left: 24, top: "50%", transform: "translateY(-50%)", zIndex: 10, width: 48, height: 48, borderRadius: 14, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", backdropFilter: "blur(10px)" }}>
          <ChevronLeft size={22} />
        </button>
        <button onClick={next} style={{ position: "absolute", right: 24, top: "50%", transform: "translateY(-50%)", zIndex: 10, width: 48, height: 48, borderRadius: 14, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", backdropFilter: "blur(10px)" }}>
          <ChevronRight size={22} />
        </button>

        <div style={{ position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 10, alignItems: "center", zIndex: 10 }}>
          {SCHEMES.map((_, i) => (
            <button key={i} onClick={() => go(i)} style={{ width: current === i ? 32 : 8, height: 8, borderRadius: 4, background: current === i ? s.accent : "rgba(255,255,255,0.3)", border: "none", cursor: "pointer", transition: "all 0.4s ease", padding: 0 }} />
          ))}
        </div>
        <div style={{ position: "absolute", bottom: 28, right: 80, zIndex: 10, fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em" }}>
          GOVERNMENT OF INDIA — CITIZEN SCHEMES
        </div>
      </div>

      {/* Mini-card strip */}
      <div style={{ background: "#0f172a", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "0 60px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex" }}>
          {SCHEMES.map((sc, i) => (
            <button key={i} onClick={() => go(i)}
              style={{ flex: 1, padding: "18px 20px", background: current === i ? `${sc.accent}15` : "transparent", borderBottom: current === i ? `3px solid ${sc.accent}` : "3px solid transparent", borderTop: "none", borderLeft: "none", borderRight: "1px solid rgba(255,255,255,0.05)", cursor: "pointer", textAlign: "left", transition: "all 0.3s" }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: current === i ? sc.accent : "rgba(255,255,255,0.35)", letterSpacing: "0.1em", marginBottom: 4 }}>{sc.badge}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: current === i ? "white" : "rgba(255,255,255,0.5)", lineHeight: 1.3 }}>{sc.title.split(" ").slice(0, 3).join(" ")}</div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function HomePage() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [counter, setCounter] = useState({ complaints: 0, resolved: 0, tokens: 0 });

  useEffect(() => {
    const targets = { complaints: 12847, resolved: 9234, tokens: 48200 };
    const steps = 60;
    const interval = 2500 / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const eased = 1 - Math.pow(1 - step / steps, 4);
      setCounter({
        complaints: Math.floor(targets.complaints * eased),
        resolved: Math.floor(targets.resolved * eased),
        tokens: Math.floor(targets.tokens * eased),
      });
      if (step >= steps) clearInterval(timer);
    });
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveFeature(p => (p + 1) % features.length), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="bg-grid" style={{ minHeight: "100vh", backgroundColor: "hsl(var(--bg-deep))", position: "relative", overflowX: "hidden" }}>
      {floatingOrbs.map((orb, i) => (
        <div key={i} style={{
          position: "fixed", width: orb.size, height: orb.size, borderRadius: "50%",
          background: orb.color, filter: "blur(120px)", zIndex: 0,
          top: orb.top, left: (orb as any).left, right: (orb as any).right, bottom: (orb as any).bottom,
          animationDelay: `${orb.delay}s`, pointerEvents: "none",
        }} />
      ))}

      {/* Navbar */}
      <motion.nav initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, ease: "circOut" }}
        style={{ position: "sticky", top: 0, zIndex: 100, padding: "20px 60px", display: "flex", alignItems: "center", justifyContent: "space-between", backdropFilter: "blur(24px)", borderBottom: "1px solid hsla(0,0%,100%,0.05)", background: "hsla(var(--bg-obsidian), 0.92)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Logo size={42} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 11, fontWeight: 900, color: "hsl(var(--primary))", letterSpacing: "0.15em" }}>CITIX CIVIC TECH</span>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", fontWeight: 700, letterSpacing: "0.1em" }}>POWERED BY GRIEVANCEOS</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Link href="/citizen/login"><button className="btn-premium btn-premium-secondary" style={{ padding: "10px 24px", fontSize: 14 }}>Citizen Login</button></Link>
          <Link href="/admin/login"><button className="btn-premium btn-premium-primary" style={{ padding: "10px 24px", fontSize: 14 }}>Admin Portal</button></Link>
        </div>
      </motion.nav>

      {/* ════ GOVERNMENT SCHEMES SHOWCASE ════ */}
      <SchemesCarousel />

      {/* Hero */}
      <section style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 40px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1000, textAlign: "center" }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8 }}
            className="neon-pulse"
            style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "hsla(var(--primary), 0.1)", border: "1px solid hsla(var(--primary), 0.2)", borderRadius: 999, padding: "8px 24px", marginBottom: 40, fontSize: 14, color: "hsl(var(--primary))", fontWeight: 700 }}>
            <Zap size={16} />&nbsp;THE FUTURE OF GOVERNANCE IS HERE
          </motion.div>
          
          <motion.h1 initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 1 }}
            style={{ fontSize: "clamp(48px, 8vw, 96px)", fontWeight: 800, lineHeight: 0.95, marginBottom: 32, letterSpacing: "-0.04em" }}>
            <span style={{ color: "hsl(var(--text-dark))" }}>Revolutionizing</span><br />
            <span className="text-gradient">Citizen Resolution</span>
          </motion.h1>

          <motion.p initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4, duration: 0.8 }}
            style={{ fontSize: 20, color: "hsl(var(--text-dim))", maxWidth: 700, margin: "0 auto 60px", lineHeight: 1.6, fontWeight: 500 }}>
            A world-class civic platform leveraging AI &amp; Secure Audit Log to transform urban management. Built for the Bengaluru Hackathon 2026.
          </motion.p>

          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6, duration: 0.8 }}
            style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/citizen/register">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}
                className="btn-premium btn-premium-primary" style={{ padding: "20px 48px", fontSize: 18, borderRadius: 20 }}>
                File a Complaint <ChevronRight size={22} />
              </motion.button>
            </Link>
            <Link href="/citizen/login">
              <motion.button whileHover={{ scale: 1.05 }}
                className="btn-premium btn-premium-secondary" style={{ padding: "20px 48px", fontSize: 18, borderRadius: 20 }}>
                Track Status
              </motion.button>
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 0.8 }}
            style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 40 }}>
            {["🏙️ SDG 11 – Sustainable Cities", "⚖️ SDG 16 – Strong Institutions", "🌍 SDG 17 – Partnerships", "🔒 SDG 16 – Justice"].map(t => (
              <span key={t} style={{ fontSize: 12, color: "hsl(var(--text-dim))", background: "hsla(0,0%,100%,0.04)", border: "1px solid hsla(0,0%,100%,0.08)", borderRadius: 999, padding: "6px 16px", fontWeight: 600 }}>{t}</span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Live Stats */}
      <section style={{ padding: "0 60px 100px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 24 }}>
          {SITE_STATS.map((s, i) => (
            <motion.div key={s.label} initial={{ y: 40, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}
              transition={{ delay: 0.1 * i, duration: 0.8, ease: "easeOut" }}
              className="glass stat-widget perspective-hover"
              style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: `${s.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, border: `1px solid ${s.color}30` }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: 38, fontWeight: 800, color: s.color, fontFamily: "Space Grotesk", lineHeight: 1 }}>
                  {i === 3 ? "12" : counter[Object.keys(counter)[i] as keyof typeof counter].toLocaleString()}
                </div>
                <div style={{ fontSize: 14, color: "hsl(var(--text-dim))", fontWeight: 600, marginTop: 4 }}>{s.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: "80px 40px 100px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <motion.div initial={{ y: 40, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 80 }}>
            <div className="premium-badge" style={{ marginBottom: 16 }}>NEXT-GEN CAPABILITIES</div>
            <h2 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, marginBottom: 20 }}>Engineered for <span className="text-gradient">Scale</span></h2>
            <p style={{ color: "hsl(var(--text-dim))", fontSize: 18, maxWidth: 600, margin: "0 auto", fontWeight: 500 }}>The most advanced civic complaint architecture ever deployed for Indian cities.</p>
          </motion.div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))", gap: 24 }} className="perspective-container">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ scale: 0.9, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                whileHover={{ rotateY: -5, rotateX: 5, z: 10 }} className="glass perspective-hover"
                style={{ padding: 40, border: `1px solid ${activeFeature === i ? f.color + "60" : "hsla(0,0%,100%,0.08)"}`, background: activeFeature === i ? `${f.color}10` : undefined }}>
                <div style={{ width: 64, height: 64, borderRadius: 18, background: `${f.color}20`, border: `1px solid ${f.color}40`, display: "flex", alignItems: "center", justifyContent: "center", color: f.color, marginBottom: 24 }}>{f.icon}</div>
                <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, color: "hsl(var(--text-dark))" }}>{f.title}</h3>
                <p style={{ color: "hsl(var(--text-dim))", fontSize: 16, lineHeight: 1.7 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Secure Ledger Visual */}
      <section style={{ padding: "80px 40px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="glass-strong animate-float-premium" style={{ padding: "80px 40px", textAlign: "center", border: "1px solid hsla(var(--primary), 0.2)" }}>
            <h2 style={{ fontSize: 38, fontWeight: 800, marginBottom: 16, color: "hsl(var(--text-dark))" }}>Secure Audit <span className="text-gradient">Integrity</span></h2>
            <p style={{ color: "hsl(var(--text-dim))", marginBottom: 60, fontSize: 18, maxWidth: 700, margin: "0 auto 60px" }}>Every report is audited and secured on the distributed ledger, making it impossible to hide or delete.</p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
              {["Issue Filed", "AI Analysis", "Hash Created", "Immutable Log", "Reward Issued"].map((step, i) => (
                <div key={step} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.2 }}
                    className="glass" style={{ padding: "16px 28px", fontSize: 14, fontWeight: 800, color: "hsl(var(--text-dark))", background: "linear-gradient(135deg, hsla(var(--primary),0.15), hsla(var(--accent),0.15))", border: "1px solid hsla(var(--primary),0.3)" }}>
                    {step}
                  </motion.div>
                  {i < 4 && <div style={{ width: 30, height: 2, background: "hsla(0,0%,100%,0.1)", borderRadius: 1 }} />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Weekly Heroes */}
      <section style={{ padding: "100px 40px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 60, alignItems: "center" }}>
            <motion.div initial={{ x: -60, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }}>
              <div className="premium-badge" style={{ marginBottom: 16, background: "rgba(245,158,11,0.1)", color: "#f59e0b", borderColor: "rgba(245,158,11,0.2)" }}>GOVERNANCE CHAMPIONS</div>
              <h2 style={{ fontSize: 48, fontWeight: 800, marginBottom: 20 }}>Weekly <span className="text-gradient-gold">Civic Heroes</span></h2>
              <p style={{ color: "hsl(var(--text-dim))", marginBottom: 48, fontSize: 18, lineHeight: 1.7 }}>Top contributors who help Bengaluru evolve. Earn points for every validated issue.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {weeklyHeroes.map((h, i) => (
                  <motion.div key={h.name} initial={{ x: -40, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}
                    className="glass" style={{ display: "flex", alignItems: "center", gap: 20, padding: 24 }}>
                    <div style={{ fontSize: 32 }}>{h.badge}</div>
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18, color: "white" }}>{h.avatar}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 18 }}>{h.name}</div>
                      <div style={{ color: "hsl(var(--text-dim))", fontSize: 14, fontWeight: 500 }}>{h.complaints} contributions · {h.pts} pts</div>
                    </div>
                    <div className="text-gradient-gold" style={{ fontWeight: 800, fontSize: 24, fontFamily: "Space Grotesk" }}>{h.pts}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ x: 60, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }}
              className="glass-strong" style={{ padding: 60, background: "hsla(var(--bg-obsidian), 0.6)" }}>
              <h3 style={{ fontSize: 28, fontWeight: 800, marginBottom: 32 }}>The Protocol</h3>
              {[
                { step: "01", text: "Secure Biometric Auth & Verification" },
                { step: "02", text: "Report with GPS Precision & AI Tagging" },
                { step: "03", text: "Automatic Routing to Field Officials" },
                { step: "04", text: "Real-time Secure Proof Issued" },
                { step: "05", text: "Resolution & Community Rewards" },
              ].map(s => (
                <div key={s.step} style={{ display: "flex", gap: 24, marginBottom: 28, alignItems: "center" }}>
                  <div style={{ fontSize: 14, fontWeight: 900, color: "hsl(var(--primary))", background: "hsla(var(--primary), 0.1)", width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s.step}</div>
                  <div style={{ color: "hsl(var(--text-main))", fontSize: 16, fontWeight: 600 }}>{s.text}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "100px 40px 150px", position: "relative", zIndex: 1, textAlign: "center" }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }}
          className="glass-strong" style={{ maxWidth: 900, margin: "0 auto", padding: "100px 60px", border: "1px solid hsla(var(--primary), 0.3)", overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "radial-gradient(circle at top right, hsla(var(--primary), 0.1), transparent 70%)", pointerEvents: "none" }} />
          <div style={{ fontSize: 64, marginBottom: 32 }}>🏛️</div>
          <h2 style={{ fontSize: "clamp(32px, 6vw, 56px)", fontWeight: 800, marginBottom: 24, color: "hsl(var(--text-dark))" }}>Ready to <span className="text-gradient">Modernize</span> Bharat?</h2>
          <p style={{ color: "hsl(var(--text-dim))", marginBottom: 60, fontSize: 20, maxWidth: 650, margin: "0 auto 60px", fontWeight: 500 }}>Join the ecosystem of responsible urbanism. Empowering Bengaluru, one click at a time.</p>
          <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/citizen/register"><button className="btn-premium btn-premium-primary" style={{ padding: "20px 60px", fontSize: 18 }}>Get Started Now <ChevronRight size={20} /></button></Link>
            <Link href="/admin/login"><button className="btn-premium btn-premium-secondary" style={{ padding: "20px 60px", fontSize: 18 }}>Authorized Access</button></Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid hsla(0,0%,100%,0.05)", padding: "60px 40px", textAlign: "center", color: "hsl(var(--text-dim))", fontSize: 14, position: "relative", zIndex: 1, background: "hsla(var(--bg-deep), 0.8)" }}>
        <Logo size={32} />
        <p style={{ marginTop: 24, fontWeight: 500 }}>Built for Build for Bengaluru Hackathon 2026 · Aligned with SDG Goals 11, 16, &amp; 17</p>
        <p style={{ marginTop: 8, opacity: 0.6 }}>© 2026 GrievanceOS · CITIX Civic Tech · All Rights Reserved</p>
      </footer>
    </div>
  );
}
