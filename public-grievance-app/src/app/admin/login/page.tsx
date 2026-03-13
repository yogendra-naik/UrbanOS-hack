"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db } from "@/lib/store";
import { Eye, EyeOff, Mail, Lock, Shield, AlertTriangle } from "lucide-react";
import Logo from "@/components/Logo";

export default function AdminLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    const admin = db.loginAdmin(form.email, form.password);
    if (admin) {
      if (typeof window !== "undefined") localStorage.setItem("currentAdmin", JSON.stringify(admin));
      router.push("/admin/dashboard");
    } else {
      setError("Invalid credentials. Try: roads@bbmp.gov.in / Admin@123");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#020409,#0a0f1e,#020409)", padding: 20, position: "relative", overflow: "hidden" }}>
      <div className="animate-blob" style={{ position: "fixed", width: 400, height: 400, background: "rgba(239,68,68,0.08)", borderRadius: "50%", filter: "blur(80px)", top: "5%", left: "-5%", zIndex: 0 }} />
      <div className="animate-blob animation-delay-2" style={{ position: "fixed", width: 300, height: 300, background: "rgba(234,179,8,0.06)", borderRadius: "50%", filter: "blur(60px)", bottom: "10%", right: "0%", zIndex: 0 }} />
      
      <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-strong" style={{ width: "100%", maxWidth: 440, padding: "48px 40px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 999, padding: "4px 14px", marginBottom: 20, fontSize: 12, color: "#f87171" }}>
          <AlertTriangle size={12} /> RESTRICTED ACCESS — Government Officials Only
        </div>
        
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <Logo size={52} showText={false} />
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: "white" }}>Admin Portal</h1>
              <p style={{ color: "#64748b", fontSize: 13 }}>BBMP / BESCOM Official Login</p>
            </div>
          </div>
        </div>

        <div style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 10, padding: "10px 14px", marginBottom: 20, fontSize: 12.5, color: "#a5b4fc" }}>
          <strong>Demo:</strong> roads@bbmp.gov.in / Admin@123
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ position: "relative" }}>
            <Mail size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
            <input className="input-field" style={{ paddingLeft: 40 }} type="email" placeholder="Official Email (e.g., name@bbmp.gov.in)" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          
          <div style={{ position: "relative" }}>
            <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
            <input className="input-field" style={{ paddingLeft: 40, paddingRight: 44 }} type={show ? "text" : "password"} placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            <button type="button" onClick={() => setShow(!show)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#64748b", cursor: "pointer" }}>
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, color: "#f87171", fontSize: 13 }}>{error}</motion.div>}
          
          <button type="submit" style={{ background: "linear-gradient(135deg,#dc2626,#f97316)", color: "white", border: "none", borderRadius: 12, padding: "14px", fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 4, transition: "all 0.2s" }} disabled={loading}>
            {loading ? "Verifying identity..." : "Secure Login →"}
          </button>
        </form>

        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#334155", fontSize: 12 }}>
            <Shield size={12} /><span>Multi-factor authentication enabled</span>
          </div>
          <p style={{ textAlign: "center", color: "#334155", fontSize: 13, marginTop: 4 }}>
            <Link href="/" style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← Return to Citizen Portal</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
