"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db, type Admin, type Complaint, type Circular, type EmergencyContact, type DeveloperFeedback } from "@/lib/store";
import { getStatusColor, getPriorityColor, formatDate } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { LogOut, Shield, Bell, CheckCircle, AlertTriangle, Clock, TrendingUp, X, ChevronDown, ChevronUp, Zap, FileText, Send, ShieldAlert, PhoneCall, Trash2, Edit2, Plus, Star, MessageSquareQuote, Search, Users, MapPin } from "lucide-react";
import Logo from "@/components/Logo";
import ProfilePhotoUpload from "@/components/ProfilePhotoUpload";
import LanguagePanel from "@/components/LanguagePanel";
import TextToSpeech from "@/components/TextToSpeech";

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
const PriorityBadge = ({ priority }: { priority: string }) => {
  const colors: any = {
    LOW: { bg: "#f8fafc", text: "#64748b", border: "#e2e8f0" },
    MEDIUM: { bg: "#f0f9ff", text: "#0369a1", border: "#bae6fd" },
    HIGH: { bg: "#fffbeb", text: "#b45309", border: "#fef3c7" },
    CRITICAL: { bg: "#fff1f2", text: "#be123c", border: "#fecdd3" }
  };
  const config = colors[priority] || colors.LOW;
  return (
    <span style={{ 
      backgroundColor: config.bg, 
      color: config.text, 
      padding: "6px 14px", 
      borderRadius: 12, 
      fontSize: 11, 
      fontWeight: 900, 
      border: `1px solid ${config.border}`,
      letterSpacing: "0.02em"
    }}>
      {priority}
    </span>
  );
};

function ResolveModal({ complaint, admin, lang, onClose, onResolve }: { complaint: Complaint; admin: Admin; lang: string; onClose: () => void; onResolve: () => void }) {
  const [resolution, setResolution] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imgExpanded, setImgExpanded] = useState(false);

  const handleResolve = async () => {
    if (!resolution.trim()) return;
    setLoading(true);
    setError(null);
    await new Promise(r => setTimeout(r, 1500));
    try {
      db.resolveComplaint(complaint.id, resolution, admin.id);
      setLoading(false);
      setDone(true);
      setTimeout(() => { onResolve(); onClose(); }, 1500);
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  };

  const handleEscalate = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    db.escalateComplaint(complaint.id);
    setLoading(false);
    onResolve();
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "hsla(var(--bg-obsidian), 0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, backdropFilter: "blur(12px)", padding: 24 }}>
      <AnimatePresence>
        {imgExpanded && complaint.imageUrl && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setImgExpanded(false)} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.95)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "zoom-out" }}>
            <img src={complaint.imageUrl} alt="Evidence" style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: 24, boxShadow: "0 0 100px rgba(0,0,0,0.8)" }} />
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="glass-strong" style={{ width: "100%", maxWidth: 640, maxHeight: "92vh", overflowY: "auto", padding: 40, position: "relative", border: "1px solid #eee", background: "white", color: "hsl(var(--text-main))", boxShadow: "0 20px 50px rgba(0,0,0,0.15)" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 24, right: 24, background: "hsla(var(--bg-obsidian), 0.05)", border: "none", color: "hsl(var(--text-dim))", cursor: "pointer", borderRadius: 12, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}><X size={20} /></button>
        {done ? (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <div className="neon-pulse" style={{ width: 80, height: 80, borderRadius: "50%", background: "hsla(var(--success), 0.1)", border: "2px solid hsl(var(--success))", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 32px" }}>
              <CheckCircle size={40} color="hsl(var(--success))" />
            </div>
            <h2 style={{ fontWeight: 900, fontSize: 28, fontFamily: "Space Grotesk", marginBottom: 12, color: "hsl(var(--text-dark))" }}>TICKET RESOLVED</h2>
            <p style={{ color: "hsl(var(--text-dim))", fontSize: 16, fontWeight: 500 }}>ACR Ledger updated. Citizen has been notified.</p>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <StatusBadge status={complaint.status} />
              <span style={{ fontSize: 12, fontWeight: 800, color: "hsl(var(--text-dim))", letterSpacing: "0.1em" }}>#{complaint.ticketId}</span>
            </div>
            <h2 style={{ fontWeight: 900, fontSize: 32, marginBottom: 16, fontFamily: "Space Grotesk", color: "hsl(var(--text-dark))", lineHeight: 1.1 }}>{complaint.title}</h2>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>
              <div className="glass" style={{ padding: 20, borderRadius: 20, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: 11, color: "hsl(var(--text-dim))", fontWeight: 800, marginBottom: 8, letterSpacing: "0.05em" }}>CITIZEN CONTACT</div>
                <div style={{ fontWeight: 800, fontSize: 16, color: "hsl(var(--text-dark))" }}>{complaint.userName}</div>
              </div>
              <div className="glass" style={{ padding: 20, borderRadius: 20, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: 11, color: "hsl(var(--text-dim))", fontWeight: 800, marginBottom: 8, letterSpacing: "0.05em" }}>SLA DEADLINE</div>
                <div style={{ fontWeight: 800, fontSize: 16, color: new Date(complaint.deadline) < new Date() ? "hsl(var(--danger))" : "hsl(var(--text-dark))" }}>{formatDate(complaint.deadline)}</div>
              </div>
            </div>

            <div style={{ position: "relative", marginBottom: 32, padding: 32, background: "hsla(var(--bg-obsidian), 0.03)", borderRadius: 24, border: "1px solid hsla(var(--bg-obsidian), 0.05)" }}>
              <p style={{ color: "hsl(var(--text-main))", fontSize: 16, lineHeight: 1.7, margin: 0, fontWeight: 500 }}>{complaint.description}</p>
              <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
                <TextToSpeech text={complaint.description} lang={lang} size="sm" label="Read Intelligence" />
              </div>
            </div>

            {complaint.imageUrl && (
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 11, color: "hsl(var(--text-dim))", fontWeight: 800, marginBottom: 12 }}>VISUAL EVIDENCE</div>
                <div onClick={() => setImgExpanded(true)} className="perspective-hover" style={{ cursor: "zoom-in", borderRadius: 24, overflow: "hidden", border: "1px solid #e2e8f0", background: "#f1f5f9" }}>
                  <img src={complaint.imageUrl} alt="Evidence" style={{ width: "100%", maxHeight: 300, objectFit: "cover" }} />
                </div>
              </div>
            )}

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24, padding: "16px 20px", background: "hsla(var(--danger), 0.05)", border: "1px solid hsla(var(--danger), 0.2)", borderRadius: 16, color: "hsl(var(--danger))", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 12 }}>
                <ShieldAlert size={20} />
                {error}
              </motion.div>
            )}

            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 11, color: "hsl(var(--text-dim))", fontWeight: 800, marginBottom: 12 }}>RESOLUTION LOG</div>
              <textarea 
                className="input-field" 
                style={{ width: "100%", minHeight: 140, padding: 20, fontSize: 15, borderRadius: 20, background: "white", border: "1px solid #e2e8f0", color: "hsl(var(--text-dark))", outline: "none", transition: "all 0.2s" }} 
                placeholder="Detail the official actions taken to resolve this ticket..." 
                value={resolution} 
                onChange={e => setResolution(e.target.value)} 
              />
            </div>

            <div style={{ display: "flex", gap: 16 }}>
              <button 
                onClick={handleEscalate} 
                className="btn-premium btn-premium-secondary" 
                style={{ flex: 1, padding: "18px", borderRadius: 16, color: "hsl(var(--danger))", border: "1px solid hsla(var(--danger), 0.2)", background: "white", fontWeight: 800 }} 
                disabled={loading}
              >
                Escalate
              </button>
              <button 
                onClick={handleResolve} 
                disabled={!resolution.trim() || loading} 
                className="btn-premium btn-premium-primary" 
                style={{ flex: 2, padding: "18px", borderRadius: 16 }}
              >
                {loading ? "Authorizing..." : "✅ Resolve Ticket"}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

const PIE_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444"];

export default function AdminDashboard() {
  const router = useRouter();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [allComplaints, setAllComplaints] = useState<Complaint[]>([]);
  const [circulars, setCirculars] = useState<Circular[]>([]);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [feedback, setFeedback] = useState<DeveloperFeedback[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [activeTab, setActiveTab] = useState<"tickets" | "analytics" | "officials" | "escalated" | "circulars" | "contacts" | "feedback">("tickets");
  const [filter, setFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");
  const [profilePhoto, setProfilePhoto] = useState<string>("");
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [activeLang, setActiveLang] = useState("en-IN");
  const [newCircular, setNewCircular] = useState({ title: "", content: "" });
  const [circularError, setCircularError] = useState("");
  const [feedbackError, setFeedbackError] = useState("");
  const [editingContact, setEditingContact] = useState<Partial<EmergencyContact> | null>(null);

  const loadData = () => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("currentAdmin") : null;
    if (!stored) { router.push("/admin/login"); return; }
    const a = JSON.parse(stored);
    db.loginAdmin(a.email, a.password);
    const freshAdmin = db.getCurrentAdmin() || a;
    
    // Use functional updates or cloning to ensure React detects changes
    setAdmin({ ...freshAdmin });
    
    const dept = freshAdmin.role === "SUPER_ADMIN" ? null : freshAdmin.department;
    const deptComplaints = dept ? db.getComplaintsByDept(dept) : db.getComplaints();
    setComplaints([...deptComplaints]);
    setAllComplaints([...db.getComplaints()]);
    
    // Load Circulars
    const allCircs = db.getCirculars();
    setCirculars(dept ? [...allCircs.filter(c => c.department === dept)] : [...allCircs]);

    // Load Feedback
    setFeedback([...db.getFeedback()]);

    const savedPhoto = localStorage.getItem(`adminProfilePhoto_${a.email}`) || "";
    setProfilePhoto(savedPhoto);
  };

  useEffect(() => { loadData(); }, []);

  const handleLogout = () => {
    db.logout();
    if (typeof window !== "undefined") localStorage.removeItem("currentAdmin");
    router.push("/");
  };

  const publishCircular = () => {
    if (!newCircular.title || !newCircular.content || !admin) return;
    setCircularError("");
    try {
      db.addCircular(admin.id, admin.name, admin.role === "SUPER_ADMIN" ? "General Administration" : admin.department, newCircular.title, newCircular.content);
      setNewCircular({ title: "", content: "" });
      loadData(); // reload circulars
    } catch (e: any) {
      setCircularError(e.message);
    }
  };

  const handleSaveContact = () => {
    if (!editingContact?.title || !editingContact?.number || !editingContact?.department) return;
    if (editingContact.id) {
      db.updateContact(editingContact.id, editingContact.title, editingContact.number, editingContact.department, editingContact.description || "");
    } else {
      db.addContact(editingContact.title, editingContact.number, editingContact.department, editingContact.description || "");
    }
    setEditingContact(null);
    loadData();
  };

  const handleDeleteContact = (id: string) => {
    if (confirm("Are you sure you want to delete this emergency contact?")) {
      db.deleteContact(id);
      loadData();
    }
  };

  if (!admin) return <div style={{ minHeight: "100vh", background: "#020409", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ color: "#ef4444", fontSize: 18 }}>Loading secure session...</div></div>;

  const stats = db.getAdminStats(admin.department);
  const globalStats = db.getStats();

  const filtered = complaints.filter(c => filter === "ALL" || c.status === filter || c.priority === filter).sort((a, b) => {
    if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === "priority") { const ord = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 }; return (ord[b.priority] || 0) - (ord[a.priority] || 0); }
    if (sortBy === "deadline") return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    return 0;
  });

  const escalated = complaints.filter(c => c.status === "ESCALATED");
  const overdue = complaints.filter(c => new Date(c.deadline) < new Date() && c.status !== "RESOLVED");

  const pieData = [
    { name: "Pending", value: stats.pending },
    { name: "Resolved", value: stats.resolved },
    { name: "In Progress", value: stats.inProgress },
    { name: "Escalated", value: stats.escalated },
  ];

  const barData = ["Roads & Infrastructure", "Water Supply", "Sanitation & Waste Management", "Electricity & Power", "Street Lighting"].map(d => ({
    dept: d.split(" ")[0],
    total: allComplaints.filter(c => c.department === d).length,
    resolved: allComplaints.filter(c => c.department === d && c.status === "RESOLVED").length,
  }));

  if (!admin) return <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "hsl(var(--bg-deep))", color: "hsl(var(--text-main))" }}>Loading Secure Admin Node...</div>;
  const acrColor = admin.acrScore >= 80 ? "#10b981" : admin.acrScore >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", backgroundColor: "hsl(var(--bg-deep))", color: "hsl(var(--text-main))", fontFamily: "Inter, sans-serif" }}>
      {/* Premium Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 100, borderBottom: "1px solid hsla(var(--bg-obsidian), 0.1)", background: "hsl(var(--bg-obsidian))", backdropFilter: "blur(24px)", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "white" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <Logo size={40} />
          <div className="glass" style={{ display: "flex", alignItems: "center", padding: "8px 20px", gap: 12, minWidth: 400, border: "1px solid hsla(0,0%,100%,0.2)", background: "hsla(0,0%,100%,0.1)", borderRadius: 14 }}>
            <Search size={18} color="hsla(0,0%,100%,0.6)" />
            <input placeholder="Search tickets, officials, or department logs..." style={{ background: "transparent", border: "none", color: "white", outline: "none", fontSize: 14, width: "100%", fontWeight: 500 }} />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 800, fontSize: 15, fontFamily: "Space Grotesk" }}>{admin.name}</div>
              <div style={{ fontSize: 11, color: "hsl(var(--danger))", fontWeight: 800, letterSpacing: "0.05em" }}>{admin.role.replace("_", " ")}</div>
            </div>
            <ProfilePhotoUpload 
              photo={profilePhoto} 
              initials={admin.avatar} 
              gradient="linear-gradient(135deg,#dc2626,#f97316)"
              size={48} 
              onPhotoChange={(b64) => { setProfilePhoto(b64); localStorage.setItem(`adminProfilePhoto_${admin.email}`, b64); }} 
            />
          </div>
          <button onClick={handleLogout} className="btn-premium btn-premium-primary" style={{ padding: "10px 20px", borderRadius: 12, display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700 }}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Modern Admin Sidebar */}
        <aside style={{ width: 300, borderRight: "1px solid hsla(var(--bg-obsidian), 0.05)", background: "hsla(var(--bg-obsidian), 0.03)", display: "flex", flexDirection: "column", padding: "32px 24px" }}>
          <div style={{ marginBottom: 32, padding: "0 12px" }}>
            <div style={{ fontSize: 11, color: "hsl(var(--text-dim))", fontWeight: 800, letterSpacing: "0.15em", marginBottom: 20 }}>ADMIN CONTROL</div>
          </div>
          <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
            {[
              { key: "tickets", icon: <FileText size={20} />, label: "Grievance Tickets" },
              { key: "analytics", icon: <TrendingUp size={20} />, label: "System Analytics" },
              { key: "escalated", icon: <ShieldAlert size={20} />, label: `Escalated (${escalated.length})` },
              { key: "officials", icon: <Users size={20} />, label: "Dept Staff" },
              { key: "circulars", icon: <Bell size={20} />, label: "Bulletins" },
              { key: "contacts", icon: <PhoneCall size={20} />, label: "Emergency List" },
              { key: "feedback", icon: <MessageSquareQuote size={20} />, label: "Dev Feedback" },
            ].map(item => (
              <button 
                key={item.key} 
                onClick={() => setActiveTab(item.key as any)}
                className={`sidebar-item ${activeTab === item.key ? "active" : ""}`}
                style={{ 
                  width: "100%", 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 16, 
                  padding: "16px 20px", 
                  borderRadius: 16, 
                  border: "none", 
                  cursor: "pointer", 
                  background: activeTab === item.key ? "hsla(var(--primary), 0.1)" : "transparent",
                  color: activeTab === item.key ? "hsl(var(--primary))" : "hsl(var(--text-dim))",
                  fontWeight: activeTab === item.key ? 800 : 600,
                  fontSize: 14,
                  transition: "all 0.2s",
                  textAlign: "left"
                }}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </nav>

          <div className={`glass ${admin.acrScore < 60 ? "neon-pulse" : ""}`} style={{ marginTop: "auto", padding: 24, border: `1px solid ${admin.acrScore < 60 ? "hsla(var(--danger), 0.3)" : "hsla(var(--success), 0.2)"}`, background: "white", borderRadius: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: "hsl(var(--text-dim))", fontWeight: 800, letterSpacing: "0.05em" }}>OPERATIONAL ACR</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: acrColor, fontFamily: "Space Grotesk" }}>{admin.acrScore}</div>
            </div>
            <div className="progress-bar" style={{ height: 6, background: "#eee" }}><div className="progress-fill" style={{ width: `${admin.acrScore}%`, background: `linear-gradient(90deg, ${acrColor}, ${acrColor}aa)` }} /></div>
            {admin.warningCount > 0 && (
              <div style={{ marginTop: 16, color: "hsl(var(--danger))", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                <AlertTriangle size={12} /> {admin.warningCount} Performance Warning(s)
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <main style={{ flex: 1, overflowY: "auto", padding: "48px 64px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 48 }}>
          <div>
            <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 8, fontFamily: "Space Grotesk", color: "hsl(var(--text-dark))" }}>
              Welcome back, {admin.name.split(" ")[0]}
            </h1>
            <p style={{ color: "hsl(var(--text-dim))", fontSize: 16, fontWeight: 500 }}>Department: {admin.department} · Oversight Control</p>
          </div>
          {overdue.length > 0 && (
            <div className="glass neon-pulse" style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 24px", border: "1px solid hsla(var(--danger), 0.3)", borderRadius: 16, color: "hsl(var(--danger))", fontSize: 14, fontWeight: 700, background: "white" }}>
              <AlertTriangle size={20} /> {overdue.length} tickets overdue — ACR impacts imminent
            </div>
          )}
        </div>

        {/* Premium Admin Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 20, marginBottom: 48 }}>
          {[
            { label: "Total Load", value: stats.total, icon: <FileText size={22} />, color: "hsl(var(--primary))" },
            { label: "Pending", value: stats.pending, icon: <Clock size={22} />, color: "hsl(var(--warning))" },
            { label: "Active", value: stats.inProgress, icon: <Zap size={22} />, color: "hsl(var(--accent))" },
            { label: "Resolved", value: stats.resolved, icon: <CheckCircle size={22} />, color: "hsl(var(--success))" },
            { label: "Escalated", value: stats.escalated, icon: <ShieldAlert size={22} />, color: "hsl(var(--danger))" },
          ].map(s => (
            <motion.div 
              key={s.label} 
              whileHover={{ y: -6, scale: 1.02 }} 
              className="glass" 
              style={{ padding: 24, borderRadius: 20, border: "1px solid hsla(var(--bg-obsidian), 0.05)", background: "white", textAlign: "center" }}
            >
              <div style={{ color: s.color, marginBottom: 16, display: "flex", justifyContent: "center" }}>{s.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "hsl(var(--text-main))", fontFamily: "Space Grotesk", marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "hsl(var(--text-dim))", fontWeight: 800, letterSpacing: "0.05em" }}>{s.label.toUpperCase()}</div>
            </motion.div>
          ))}
        </div>

        {/* Tickets Tab */}
        {activeTab === "tickets" && (
          <div>
            <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, flex: 1 }}>Complaint Tickets</h2>
              <div style={{ display: "flex", gap: 8 }}>
                {["ALL", "PENDING", "IN_PROGRESS", "RESOLVED", "ESCALATED", "CRITICAL"].map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{ padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: filter === f ? 700 : 400, background: filter === f ? "hsl(var(--primary))" : "white", border: `1px solid ${filter === f ? "hsl(var(--primary))" : "hsla(var(--bg-obsidian), 0.1)"}`, color: filter === f ? "white" : "hsl(var(--text-dim))", cursor: "pointer", transition: "all 0.2s" }}>
                    {f.replace("_", " ")}
                  </button>
                ))}
              </div>
              <select className="input-field" style={{ width: "auto", padding: "6px 12px", fontSize: 13 }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="newest">Newest First</option>
                <option value="priority">Highest Priority</option>
                <option value="deadline">Deadline Soonest</option>
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {filtered.map(c => {
                const isOverdue = new Date(c.deadline) < new Date() && c.status !== "RESOLVED";
                return (
                  <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass"
                    style={{ padding: "20px", border: isOverdue ? "1px solid hsl(var(--danger))" : "1px solid hsla(var(--bg-obsidian), 0.05)", background: "white", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                          <StatusBadge status={c.status} />
                          <PriorityBadge priority={c.priority} />
                          {isOverdue && <span className="badge" style={{ color: "white", background: "hsl(var(--danger))", borderColor: "hsl(var(--danger))", fontSize: 10 }}>⚠ OVERDUE</span>}
                          <span style={{ fontSize: 11, color: "hsl(var(--text-dim))", background: "hsla(var(--bg-obsidian), 0.05)", padding: "2px 8px", borderRadius: 6, fontWeight: 700 }}>#{c.ticketId}</span>
                        </div>
                        <h3 style={{ fontWeight: 800, fontSize: 16, marginBottom: 6, color: "hsl(var(--text-dark))" }}>{c.title}</h3>
                        <div style={{ fontSize: 13, color: "hsl(var(--text-dim))", display: "flex", gap: 16, flexWrap: "wrap", fontWeight: 500 }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Users size={14} /> {c.userName}</span>
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={14} /> {c.location}</span>
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={14} /> {formatDate(c.createdAt)}</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, flexShrink: 0 }}>
                        <button onClick={() => setSelectedComplaint(c)} className="btn-premium btn-premium-primary" style={{ padding: "8px 16px", borderRadius: 10, fontSize: 13 }}>
                          Take Action →
                        </button>
                        <div style={{ fontSize: 11, color: isOverdue ? "hsl(var(--danger))" : "hsl(var(--text-dim))", fontWeight: 700 }}>
                          Deadline: {formatDate(c.deadline)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              {filtered.length === 0 && (
                <div className="glass" style={{ textAlign: "center", padding: 64, background: "white" }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
                  <p style={{ fontWeight: 800, color: "hsl(var(--text-dark))", fontSize: 18 }}>Clear Queue!</p>
                  <p style={{ color: "hsl(var(--text-dim))" }}>No tickets matching your current filter.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>📊 Performance Intelligence</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
              <div className="glass" style={{ padding: 24, background: "white" }}>
                <h3 style={{ fontWeight: 800, marginBottom: 24, color: "hsl(var(--text-dark))" }}>Status Metrics</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false} fontSize={12} fontWeight={700}>
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "white", border: "1px solid #eee", borderRadius: 12, color: "#333", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="glass" style={{ padding: 24, background: "white" }}>
                <h3 style={{ fontWeight: 800, marginBottom: 24, color: "hsl(var(--text-dark))" }}>Department Load</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="dept" tick={{ fill: "hsl(var(--text-dim))", fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "hsl(var(--text-dim))", fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: "hsla(var(--primary), 0.05)" }} contentStyle={{ background: "white", border: "1px solid #eee", borderRadius: 12, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }} />
                    <Bar dataKey="total" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} name="Total Load" />
                    <Bar dataKey="resolved" fill="hsl(var(--success))" radius={[6, 6, 0, 0]} name="Successful Resolutions" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="glass" style={{ padding: 32, background: "white" }}>
              <h3 style={{ fontWeight: 800, marginBottom: 20, color: "hsl(var(--text-dark))" }}>System-Wide Accountability Stats</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
                {[
                  { label: "Overall Success Rate", value: `${Math.round(globalStats.resolved / globalStats.total * 100)}%`, color: "hsl(var(--success))" },
                  { label: "Platform Throughput", value: globalStats.total, color: "hsl(var(--primary))" },
                  { label: "High Priority Count", value: globalStats.critical, color: "hsl(var(--danger))" },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: "center", padding: 24, background: "hsla(var(--bg-obsidian), 0.03)", borderRadius: 20, border: "1px solid hsla(var(--bg-obsidian), 0.05)" }}>
                    <div style={{ fontSize: 36, fontWeight: 900, color: s.color, fontFamily: "Space Grotesk", marginBottom: 4 }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: "hsl(var(--text-dim))", fontWeight: 800, letterSpacing: "0.05em" }}>{s.label.toUpperCase()}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Escalated Tab */}
        {activeTab === "escalated" && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, color: "hsl(var(--text-dark))" }}>🚨 Accountability Escalations</h2>
            <p style={{ color: "hsl(var(--text-dim))", fontSize: 14, marginBottom: 24 }}>These complaints have bypassed local departments due to critical response failures.</p>
            {escalated.length === 0 ? (
              <div className="glass" style={{ padding: 60, textAlign: "center", background: "white" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🌟</div>
                <p style={{ fontWeight: 800, color: "hsl(var(--text-dark))" }}>Operating at Maximum Efficiency</p>
                <p style={{ color: "hsl(var(--text-dim))", marginTop: 6 }}>All department service levels are within green parameters.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {escalated.map(c => (
                  <motion.div key={c.id} className="glass" style={{ padding: 24, border: "1px solid hsl(var(--danger))", background: "white", boxShadow: "0 10px 30px rgba(239,68,68,0.05)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                          <StatusBadge status="ESCALATED" />
                          <PriorityBadge priority={c.priority} />
                          <span style={{ fontSize: 11, color: "hsl(var(--text-dim))", fontWeight: 800 }}>#{c.ticketId}</span>
                        </div>
                        <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 6, color: "hsl(var(--text-dark))" }}>{c.title}</h3>
                        <p style={{ color: "hsl(var(--text-dim))", fontSize: 13, fontWeight: 500 }}>SLA Failure Level {c.escalationCount} · Filed by {c.userName}</p>
                      </div>
                      <div style={{ textAlign: "right", background: "hsla(var(--danger), 0.05)", padding: "12px 20px", borderRadius: 12, border: "1px solid hsla(var(--danger), 0.1)" }}>
                        <div style={{ fontSize: 13, color: "hsl(var(--danger))", fontWeight: 800 }}>SLA BREACHED</div>
                        <div style={{ fontSize: 11, color: "hsl(var(--text-dim))", fontWeight: 600 }}>{formatDate(c.deadline)}</div>
                        <div style={{ fontSize: 11, color: "hsl(var(--danger))", marginTop: 4, fontWeight: 700 }}>ACR -2 Points Applied</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Officials Panel */}
        {activeTab === "officials" && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, color: "hsl(var(--text-dark))" }}>🏛️ Departmental Performance Node</h2>
            <p style={{ color: "hsl(var(--text-dim))", fontSize: 14, marginBottom: 24 }}>Official accountability tracking including ACR impact and service credits.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { id: "a1", name: "Suresh Babu", dept: "Roads & Infrastructure", acr: 87, warnings: 1, deductions: 0, resolved: 45, pending: 12, avatar: "SB" },
                { id: "a2", name: "Meena Kumari", dept: "Water Supply", acr: 72, warnings: 2, deductions: 500, resolved: 38, pending: 8, avatar: "MK" },
                { id: "a3", name: "Ravi Shankar", dept: "Sanitation & Waste Management", acr: 91, warnings: 0, deductions: 0, resolved: 52, pending: 5, avatar: "RS" },
                { id: "a4", name: "Deepa Nair", dept: "Electricity & Power", acr: 65, warnings: 3, deductions: 1500, resolved: 29, pending: 18, avatar: "DN" },
              ].map(o => {
                const acrColor = o.acr >= 80 ? "#10b981" : o.acr >= 60 ? "#f59e0b" : "#ef4444";
                return (
                  <motion.div key={o.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass" style={{ padding: 24, background: "white", border: "1px solid hsla(var(--bg-obsidian), 0.05)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                      <div style={{ width: 60, height: 60, borderRadius: 16, background: "hsl(var(--bg-obsidian))", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, fontFamily: "Space Grotesk" }}>{o.avatar}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                          <span style={{ fontWeight: 800, fontSize: 18, color: "hsl(var(--text-dark))" }}>{o.name}</span>
                          {o.warnings > 0 && <span style={{ fontSize: 10, color: "white", background: "hsl(var(--danger))", padding: "2px 10px", borderRadius: 99, fontWeight: 800 }}>{o.warnings} WARNINGS</span>}
                        </div>
                        <div style={{ fontSize: 13, color: "hsl(var(--text-dim))", fontWeight: 600 }}>{o.dept}</div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,auto)", gap: "0 32px", textAlign: "center" }}>
                        <div><div style={{ fontSize: 24, fontWeight: 900, color: acrColor, fontFamily: "Space Grotesk" }}>{o.acr}</div><div style={{ fontSize: 11, color: "hsl(var(--text-dim))", fontWeight: 700 }}>ACR</div></div>
                        <div><div style={{ fontSize: 24, fontWeight: 900, color: "#10b981", fontFamily: "Space Grotesk" }}>{o.resolved}</div><div style={{ fontSize: 11, color: "hsl(var(--text-dim))", fontWeight: 700 }}>CLOSED</div></div>
                        <div><div style={{ fontSize: 24, fontWeight: 900, color: "#f59e0b", fontFamily: "Space Grotesk" }}>{o.pending}</div><div style={{ fontSize: 11, color: "hsl(var(--text-dim))", fontWeight: 700 }}>OPEN</div></div>
                        <div><div style={{ fontSize: 18, fontWeight: 900, color: o.deductions > 0 ? "hsl(var(--danger))" : "hsl(var(--success))", fontFamily: "Space Grotesk" }}>{o.deductions > 0 ? `-₹${o.deductions}` : "₹0"}</div><div style={{ fontSize: 11, color: "hsl(var(--text-dim))", fontWeight: 700 }}>PENALTY</div></div>
                      </div>
                    </div>
                    <div style={{ marginTop: 20 }}>
                      <div className="progress-bar" style={{ height: 8, background: "#f1f5f9" }}><div className="progress-fill" style={{ width: `${o.acr}%`, background: acrColor }} /></div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Circulars Tab */}
        {activeTab === "circulars" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8, color: "hsl(var(--text-dark))" }}>📢 Official Bulletins</h2>
                <p style={{ color: "hsl(var(--text-dim))", fontSize: 15, fontWeight: 500 }}>Publish critical announcements to the citizens of your jurisdiction.</p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 32 }}>
              {/* Publish Form */}
              <div className="glass" style={{ padding: 32, background: "white", border: "1px solid hsla(var(--bg-obsidian), 0.05)", borderRadius: 24, boxShadow: "0 10px 40px rgba(0,0,0,0.03)" }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 24, display: "flex", alignItems: "center", gap: 12, color: "hsl(var(--text-dark))" }}>
                   New Publication 📄
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div>
                    <label style={{ fontSize: 12, color: "hsl(var(--text-dim))", fontWeight: 800, display: "block", marginBottom: 8 }}>CIRCULAR TITLE</label>
                    <input className="input-field" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }} placeholder="e.g. Traffic Diversion Plan - March 20" value={newCircular.title} onChange={e => setNewCircular({ ...newCircular, title: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "hsl(var(--text-dim))", fontWeight: 800, display: "block", marginBottom: 8 }}>MANDATORY CONTENT</label>
                    <textarea className="input-field" style={{ minHeight: 180, resize: "none", background: "#f8fafc", border: "1px solid #e2e8f0" }} placeholder="Provide clear, concise information to citizens..." value={newCircular.content} onChange={e => setNewCircular({ ...newCircular, content: e.target.value })} />
                  </div>
                  
                  {circularError && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} style={{ padding: "12px 16px", background: "hsla(var(--danger), 0.05)", border: "1px solid hsla(var(--danger), 0.2)", borderRadius: 12, color: "hsl(var(--danger))", fontSize: 12, fontWeight: 700 }}>
                      ⚠️ {circularError}
                    </motion.div>
                  )}

                  <button onClick={publishCircular} disabled={!newCircular.title || !newCircular.content} className="btn-premium btn-premium-primary" style={{ height: 50, borderRadius: 14, justifyContent: "center" }}>
                    Broadcast to Public 🚀
                  </button>
                </div>
              </div>

              {/* Past Circulars */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {circulars.map(c => (
                  <div key={c.id} className="glass" style={{ padding: 24, background: "white", border: "1px solid hsla(var(--bg-obsidian), 0.05)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                      <h4 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "hsl(var(--text-dark))" }}>{c.title}</h4>
                      <div style={{ fontSize: 12, color: "hsl(var(--text-dim))", fontWeight: 600 }}>{formatDate(c.createdAt)}</div>
                    </div>
                    <p style={{ fontSize: 15, color: "hsl(var(--text-main))", lineHeight: 1.6, margin: 0, fontWeight: 500 }}>{c.content}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 20, paddingTop: 20, borderTop: "1px solid #f1f5f9" }}>
                      <div style={{ width: 32, height: 32, borderRadius: 10, background: "hsl(var(--bg-obsidian))", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900 }}>{c.adminName[0]}</div>
                      <span style={{ fontSize: 13, color: "hsl(var(--text-dim))", fontWeight: 600 }}>Signed: <span style={{ color: "hsl(var(--text-dark))", fontWeight: 800 }}>{c.adminName}</span></span>
                      <span style={{ marginLeft: "auto", fontSize: 11, color: "hsl(var(--primary))", background: "hsla(var(--primary), 0.05)", padding: "4px 12px", borderRadius: 99, fontWeight: 800 }}>LIVE TAPPED</span>
                    </div>
                  </div>
                ))}
                {circulars.length === 0 && <div className="glass" style={{ padding: 64, textAlign: "center", background: "white", color: "hsl(var(--text-dim))" }}>No active bulletins found.</div>}
              </div>
            </div>
          </div>
        )}

        {/* Emergency Contacts Tab */}
        {activeTab === "contacts" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>☎️ Emergency Contacts Directory</h2>
                <p style={{ color: "#94a3b8" }}>Manage essential government and emergency contact numbers available to all citizens.</p>
              </div>
              <button className="btn-primary" onClick={() => setEditingContact({ title: "", number: "", department: admin.department, description: "" })} style={{ padding: "8px 16px", fontSize: 13 }}>
                <Plus size={16} /> Add New Contact
              </button>
            </div>

            {editingContact && (
              <div className="glass" style={{ padding: 24, marginBottom: 24, border: "1px solid rgba(99,102,241,0.3)" }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>{editingContact.id ? "Edit Contact" : "Add New Contact"}</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, display: "block", marginBottom: 6 }}>Service Title</label>
                    <input className="input-field" placeholder="e.g. Ambulance, Fire, Task Force" value={editingContact.title} onChange={e => setEditingContact({ ...editingContact, title: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, display: "block", marginBottom: 6 }}>Phone Number (100, 112, etc.)</label>
                    <input className="input-field" placeholder="Emergency Number" value={editingContact.number} onChange={e => setEditingContact({ ...editingContact, number: e.target.value })} />
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, display: "block", marginBottom: 6 }}>Department</label>
                  <input className="input-field" value={editingContact.department} onChange={e => setEditingContact({ ...editingContact, department: e.target.value })} />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, display: "block", marginBottom: 6 }}>Description (Optional)</label>
                  <textarea className="input-field" style={{ minHeight: 60 }} placeholder="Short description of this service..." value={editingContact.description} onChange={e => setEditingContact({ ...editingContact, description: e.target.value })} />
                </div>
                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                  <button onClick={() => setEditingContact(null)} style={{ padding: "8px 16px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#cbd5e1", borderRadius: 8, cursor: "pointer" }}>Cancel</button>
                  <button onClick={handleSaveContact} disabled={!editingContact.title || !editingContact.number} style={{ padding: "8px 16px", background: editingContact.title && editingContact.number ? "#10b981" : "rgba(255,255,255,0.05)", border: "none", color: "white", borderRadius: 8, fontWeight: 600, cursor: editingContact.title && editingContact.number ? "pointer" : "not-allowed" }}>Save Contact</button>
                </div>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
              {contacts.map(c => (
                <div key={c.id} className="glass" style={{ padding: 20, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 4px", color: "#e2e8f0" }}>{c.title}</h3>
                      <div style={{ fontSize: 12, color: "#6366f1", fontWeight: 600 }}>{c.department}</div>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => setEditingContact(c)} style={{ background: "rgba(255,255,255,0.05)", border: "none", color: "#94a3b8", padding: 6, borderRadius: 6, cursor: "pointer" }}><Edit2 size={14} /></button>
                      <button onClick={() => handleDeleteContact(c.id)} style={{ background: "rgba(239,68,68,0.1)", border: "none", color: "#ef4444", padding: 6, borderRadius: 6, cursor: "pointer" }}><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#10b981", margin: "8px 0", fontFamily: "Space Grotesk", display: "flex", alignItems: "center", gap: 10 }}>
                    <PhoneCall size={20} color="#10b981" /> {c.number}
                  </div>
                  {c.description && <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.5, margin: "0 0 12px", flex: 1 }}>{c.description}</p>}
                </div>
              ))}
            </div>
            {contacts.length === 0 && <div className="glass" style={{ padding: 40, textAlign: "center", color: "#64748b" }}>No emergency contacts configured yet.</div>}
          </div>
        )}

        {/* Developer Feedback Tab */}
        {activeTab === "feedback" && admin && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
            {/* Give Feedback Form */}
            <div className="glass" style={{ padding: 40, background: "white", borderRadius: 24, border: "1px solid hsla(var(--bg-obsidian), 0.05)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: "hsla(var(--primary), 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <MessageSquareQuote color="hsl(var(--primary))" size={24} />
                </div>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0, color: "hsl(var(--text-dark))" }}>Submit Developer Feedback</h2>
                  <p style={{ margin: 0, color: "hsl(var(--text-dim))", fontSize: 13, fontWeight: 600 }}>Help us optimize the UrbanOs core</p>
                </div>
              </div>
              
              {feedbackSuccess ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="neon-pulse" style={{ width: 64, height: 64, borderRadius: "50%", background: "hsla(var(--success), 0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                    <CheckCircle size={32} color="hsl(var(--success))" />
                  </motion.div>
                  <p style={{ color: "hsl(var(--text-dark))", fontWeight: 800, fontSize: 18 }}>Report Transmitted</p>
                  <p style={{ color: "hsl(var(--text-dim))", marginBottom: 24 }}>The developer team has received your logs.</p>
                  <button onClick={() => setFeedbackSuccess(false)} className="btn-premium btn-premium-secondary" style={{ padding: "10px 24px", borderRadius: 12 }}>New Submission</button>
                </div>
              ) : (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  setFeedbackError("");
                  const formData = new FormData(e.currentTarget);
                  try {
                    db.addFeedback(
                      admin.id,
                      admin.name,
                      "ADMIN",
                      Number(formData.get("rating")),
                      formData.get("comment") as string,
                      formData.get("category") as any
                    );
                    setFeedback(db.getFeedback());
                    setFeedbackSuccess(true);
                  } catch (e: any) {
                    setFeedbackError(e.message);
                  }
                }} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {feedbackError && (
                    <div style={{ padding: "12px 16px", background: "#fef2f2", border: "1px solid #fee2e2", borderRadius: 12, color: "#dc2626", fontSize: 12, fontWeight: 700 }}>
                      Admin Policy Violation: {feedbackError}
                    </div>
                  )}
                  <div>
                    <label style={{ display: "block", color: "hsl(var(--text-dim))", fontSize: 12, fontWeight: 800, marginBottom: 12 }}>EXPERIENCE RATING</label>
                    <div style={{ display: "flex", gap: 10 }}>
                      {[1, 2, 3, 4, 5].map(s => (
                        <label key={s} style={{ cursor: "pointer" }}>
                          <input type="radio" name="rating" value={s} defaultChecked={s === 5} style={{ display: "none" }} />
                          <Star size={28} color={s <= 5 ? "#f59e0b" : "#e2e8f0"} fill={s <= 5 ? "#f59e0b" : "none"} style={{ transition: "all 0.2s" }} />
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", color: "hsl(var(--text-dim))", fontSize: 12, fontWeight: 800, marginBottom: 8 }}>FEEDBACK CLASS</label>
                    <select name="category" className="input-field" style={{ width: "100%", background: "#f8fafc", fontWeight: 600 }}>
                      <option value="BUG">🪲 Technical Defect</option>
                      <option value="FEATURE">💡 Strategic Feature Request</option>
                      <option value="UI">🎨 UX/UI Optimization</option>
                      <option value="OTHER">📁 Operational Efficiency</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", color: "hsl(var(--text-dim))", fontSize: 12, fontWeight: 800, marginBottom: 8 }}>DETAILED ANALYSIS</label>
                    <textarea name="comment" className="input-field" rows={5} style={{ width: "100%", background: "#f8fafc", resize: "none" }} placeholder="Describe your experience or suggest improvements..."></textarea>
                  </div>
                  <button type="submit" className="btn-premium btn-premium-primary" style={{ height: 54, borderRadius: 14, justifyContent: "center" }}>
                    Broadcast to Developers ⚡
                  </button>
                </form>
              )}
            </div>

            {/* Review Feedback Section (Developer Panel) */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Shield size={22} color="hsl(var(--primary))" />
                <h2 style={{ fontSize: 20, fontWeight: 900, margin: 0, color: "hsl(var(--text-dark))" }}>Global Feedback Stream</h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16, maxHeight: "calc(100vh - 300px)", overflowY: "auto", paddingRight: 8 }}>
                {feedback.map(f => (
                  <div key={f.id} className="glass" style={{ padding: 24, background: "white", borderLeft: `4px solid ${f.role === "ADMIN" ? "hsl(var(--primary))" : "hsl(var(--success))"}`, borderRight: "1px solid hsla(var(--bg-obsidian), 0.05)", borderTop: "1px solid hsla(var(--bg-obsidian), 0.05)", borderBottom: "1px solid hsla(var(--bg-obsidian), 0.05)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: f.role === "ADMIN" ? "hsl(var(--primary))" : "hsl(var(--success))", background: f.role === "ADMIN" ? "hsla(var(--primary), 0.05)" : "hsla(var(--success), 0.05)", padding: "2px 10px", borderRadius: 6 }}>{f.role}</span>
                        <span style={{ fontSize: 14, fontWeight: 800, color: "hsl(var(--text-dark))" }}>{f.userName}</span>
                      </div>
                      <span style={{ fontSize: 11, color: "hsl(var(--text-dim))", fontWeight: 600 }}>{formatDate(f.createdAt)}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <div style={{ display: "flex", gap: 2 }}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} color={i < f.rating ? "#f59e0b" : "#e2e8f0"} fill={i < f.rating ? "#f59e0b" : "none"} />
                        ))}
                      </div>
                      <span style={{ fontSize: 10,  color: "hsl(var(--text-dim))", background: "#f1f5f9", padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>{f.category}</span>
                    </div>
                    <p style={{ fontSize: 14, color: "hsl(var(--text-main))", margin: 0, lineHeight: 1.6, fontWeight: 500 }}>{f.comment}</p>
                  </div>
                ))}
                {feedback.length === 0 && <div className="glass" style={{ padding: 48, textAlign: "center", background: "white", color: "hsl(var(--text-dim))", fontWeight: 600 }}>No feedback stream detected.</div>}
              </div>
            </div>
          </div>
        )}
        </main>
      </div>

      {selectedComplaint && (
        <ResolveModal complaint={selectedComplaint} admin={admin} lang={activeLang} onClose={() => setSelectedComplaint(null)} onResolve={() => { loadData(); setSelectedComplaint(null); }} />
      )}
      <LanguagePanel activeLang={activeLang} onLangChange={setActiveLang} />
    </div>
  );
}
