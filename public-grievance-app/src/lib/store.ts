import { checkContentModeration, checkImageModeration } from "@/lib/utils";
export type Comment = {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: string;
};

export type Circular = {
  id: string;
  adminId: string;
  adminName: string;
  department: string;
  title: string;
  content: string;
  createdAt: string;
};

export type EmergencyContact = {
  id: string;
  title: string;
  number: string;
  department: string;
  description: string;
};

export type DeveloperFeedback = {
  id: string;
  userId: string;
  userName: string;
  role: "CITIZEN" | "ADMIN";
  rating: number;
  comment: string;
  category: "BUG" | "FEATURE" | "UI" | "OTHER";
  createdAt: string;
};

export type Complaint = {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  userEmail: string;
  title: string;
  description: string;
  category: string;
  department: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "PENDING" | "IN_PROGRESS" | "RESOLVED" | "ESCALATED";
  location: string;
  lat?: number;
  lng?: number;
  imageUrl?: string;
  blockchainHash: string;
  tokens: number;
  createdAt: string;
  updatedAt: string;
  deadline: string;
  resolution?: string;
  adminRemarks?: string;
  escalationCount: number;
  upvotes: number;
  comments: Comment[];
  isAnonymous?: boolean;
  hiddenEvidenceUrl?: string; // For audio/video of bribes
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  points: number;
  complaintsCount: number;
  resolvedCount: number;
  avatar: string;
  joinedAt: string;
  rank: number;
};

export type Admin = {
  id: string;
  name: string;
  department: string;
  email: string;
  password: string;
  role: "ADMIN" | "SUPER_ADMIN";
  acrScore: number;
  resolvedCount: number;
  pendingCount: number;
  warningCount: number;
  salaryDeductions: number;
  avatar: string;
};

function generateHash(): string {
  return "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
}

function generateTicketId(): string {
  return "GBB-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
}

const now = new Date();
const past = (days: number) => new Date(now.getTime() - days * 86400000).toISOString();
const future = (days: number) => new Date(now.getTime() + days * 86400000).toISOString();

export const initialFeedback: DeveloperFeedback[] = [
  { id: "f1", userId: "u1", userName: "Arjun Kumar", role: "CITIZEN", rating: 5, comment: "The AI categorization is amazing!", category: "UI", createdAt: past(2) },
];

export const initialComplaints: Complaint[] = [
  {
    id: "c1", ticketId: "GBB-ALPHA001", userId: "u1", userName: "Arjun Kumar", userEmail: "arjun@email.com",
    title: "Massive Pothole Near Indiranagar Metro Station", description: "There is a huge pothole near the Indiranagar metro station entrance that has been causing accidents. Multiple two-wheelers have fallen. Urgent repair needed.",
    category: "Pothole / Road Damage", department: "Roads & Infrastructure", priority: "CRITICAL", status: "IN_PROGRESS",
    location: "Indiranagar, Bengaluru", lat: 12.9784, lng: 77.6408,
    blockchainHash: generateHash(), tokens: 150, createdAt: past(5), updatedAt: past(2), deadline: future(2),
    resolution: "", escalationCount: 0, upvotes: 42,
    comments: [
      { id: "cm1", userId: "u2", userName: "Priya Sharma", userAvatar: "PS", text: "I fell here yesterday! Needs immediate attention.", createdAt: past(1) },
      { id: "cm2", userId: "u3", userName: "Rahul Nair", userAvatar: "RN", text: "Thanks for reporting this Arjun.", createdAt: past(1) }
    ]
  },
  {
    id: "c2", ticketId: "GBB-BETA002", userId: "u2", userName: "Priya Sharma", userEmail: "priya@email.com",
    title: "Water Pipeline Burst on 80 Feet Road", description: "A major water pipeline has burst near the KFC on 80 Feet Road, Koramangala. Water is flooding the street and nearby shops. Major traffic disruption.",
    category: "Water Leakage / Shortage", department: "Water Supply", priority: "CRITICAL", status: "ESCALATED",
    location: "Koramangala, Bengaluru", lat: 12.9352, lng: 77.6245,
    blockchainHash: generateHash(), tokens: 200, createdAt: past(8), updatedAt: past(1), deadline: past(1),
    resolution: "", escalationCount: 2, upvotes: 87, comments: [],
  },
  {
    id: "c3", ticketId: "GBB-GAMMA003", userId: "u3", userName: "Rahul Nair", userEmail: "rahul@email.com",
    title: "Garbage Overflow - Whitefield Tech Park Area", description: "The garbage bins near the Whitefield tech park area have been overflowing for 3 days. The stench is unbearable and is causing health concerns.",
    category: "Garbage / Waste Overflow", department: "Sanitation & Waste Management", priority: "HIGH", status: "PENDING",
    location: "Whitefield, Bengaluru", lat: 12.9698, lng: 77.7500,
    blockchainHash: generateHash(), tokens: 100, createdAt: past(3), updatedAt: past(3), deadline: future(4),
    resolution: "", escalationCount: 0, upvotes: 23, comments: [],
  },
  {
    id: "c4", ticketId: "GBB-DELTA004", userId: "u1", userName: "Arjun Kumar", userEmail: "arjun@email.com",
    title: "Power Outage in JP Nagar 5th Phase", description: "Entire JP Nagar 5th phase has been without power for 6 hours. BESCOM helpline is not reachable. Hospitals and clinics are running on generators.",
    category: "Power Outage / Fault", department: "Electricity & Power", priority: "CRITICAL", status: "RESOLVED",
    location: "JP Nagar, Bengaluru", lat: 12.9080, lng: 77.5940,
    blockchainHash: generateHash(), tokens: 250, createdAt: past(10), updatedAt: past(7), deadline: future(5),
    resolution: "Power restored after transformer replacement. Team worked overnight.", escalationCount: 1, upvotes: 134, comments: [],
  },
  {
    id: "c5", ticketId: "GBB-EPSILON005", userId: "u4", userName: "Sneha Reddy", userEmail: "sneha@email.com",
    title: "Broken Street Lights - HSR Layout Sector 3", description: "Almost 8 street lights in HSR Layout sector 3 are not working for the past 2 weeks. The area is very dark at night creating safety concerns especially for women.",
    category: "Broken Street Light", department: "Street Lighting", priority: "HIGH", status: "IN_PROGRESS",
    location: "HSR Layout, Bengaluru", lat: 12.9116, lng: 77.6389,
    blockchainHash: generateHash(), tokens: 120, createdAt: past(14), updatedAt: past(3), deadline: future(1),
    resolution: "", escalationCount: 1, upvotes: 56, comments: [],
  },
  {
    id: "c6", ticketId: "GBB-ZETA006", userId: "u2", userName: "Priya Sharma", userEmail: "priya@email.com",
    title: "Sewage Overflow Near Richmond Circle", description: "Sewage is overflowing onto the road near Richmond Circle. The situation is a serious health hazard. Children playing nearby are at risk.",
    category: "Sewage / Drainage Problem", department: "Drainage & Flooding", priority: "CRITICAL", status: "PENDING",
    location: "Richmond Town, Bengaluru", lat: 12.9683, lng: 77.6007,
    blockchainHash: generateHash(), tokens: 180, createdAt: past(1), updatedAt: past(1), deadline: future(2),
    resolution: "", escalationCount: 0, upvotes: 61, comments: [],
  },
];

export const initialUsers: User[] = [
  { id: "u1", name: "Arjun Kumar", email: "arjun@email.com", phone: "9876543210", password: "Arjun@123", points: 850, complaintsCount: 12, resolvedCount: 8, avatar: "AK", joinedAt: past(90), rank: 1 },
  { id: "u2", name: "Priya Sharma", email: "priya@email.com", phone: "9123456789", password: "Priya@123", points: 720, complaintsCount: 9, resolvedCount: 7, avatar: "PS", joinedAt: past(60), rank: 2 },
  { id: "u3", name: "Rahul Nair", email: "rahul@email.com", phone: "9988776655", password: "Rahul@123", points: 540, complaintsCount: 7, resolvedCount: 5, avatar: "RN", joinedAt: past(45), rank: 3 },
  { id: "u4", name: "Sneha Reddy", email: "sneha@email.com", phone: "9090909090", password: "Sneha@123", points: 480, complaintsCount: 6, resolvedCount: 4, avatar: "SR", joinedAt: past(30), rank: 4 },
  { id: "u5", name: "Vikram Menon", email: "vikram@email.com", phone: "9111222333", password: "Vikram@123", points: 310, complaintsCount: 4, resolvedCount: 3, avatar: "VM", joinedAt: past(20), rank: 5 },
];

export const initialAdmins: Admin[] = [
  { id: "a1", name: "Suresh Babu", department: "Roads & Infrastructure", email: "roads@bbmp.gov.in", password: "Admin@123", role: "SUPER_ADMIN", acrScore: 87, resolvedCount: 45, pendingCount: 12, warningCount: 1, salaryDeductions: 0, avatar: "SB" },
  { id: "a2", name: "Meena Kumari", department: "Water Supply", email: "water@bbmp.gov.in", password: "Admin@123", role: "ADMIN", acrScore: 72, resolvedCount: 38, pendingCount: 8, warningCount: 2, salaryDeductions: 500, avatar: "MK" },
  { id: "a3", name: "Ravi Shankar", department: "Sanitation & Waste Management", email: "sanitation@bbmp.gov.in", password: "Admin@123", role: "ADMIN", acrScore: 91, resolvedCount: 52, pendingCount: 5, warningCount: 0, salaryDeductions: 0, avatar: "RS" },
  { id: "a4", name: "Deepa Nair", department: "Electricity & Power", email: "power@bescom.gov.in", password: "Admin@123", role: "ADMIN", acrScore: 65, resolvedCount: 29, pendingCount: 18, warningCount: 3, salaryDeductions: 1500, avatar: "DN" },
  { id: "a5", name: "Justice Santhosh", department: "Lokayukta (Anti-Corruption)", email: "lokayukta@karnataka.gov.in", password: "Admin@123", role: "SUPER_ADMIN", acrScore: 100, resolvedCount: 150, pendingCount: 3, warningCount: 0, salaryDeductions: 0, avatar: "JS" },
];

export const initialCirculars: Circular[] = [
  { id: "cir1", adminId: "a1", adminName: "Suresh Babu", department: "Roads & Infrastructure", title: "Heavy Rain Alert - Pothole Repair Strategy", content: "Due to expected heavy rainfall this weekend, all ongoing pothole repair work will be temporarily suspended. Emergency response teams are on standby for waterlogging issues.", createdAt: past(1) },
  { id: "cir2", adminId: "a2", adminName: "Meena Kumari", department: "Water Supply", title: "Water Supply Disruption in South Zone", content: "Pipeline maintenance will cause water supply disruption in Koramangala, BTM Layout, and HSR Layout on 15th March between 10 AM and 4 PM. Please store water accordingly.", createdAt: past(3) },
];

export const initialContacts: EmergencyContact[] = [
  { id: "em1", title: "National Emergency", number: "112", department: "General Administration", description: "Single emergency number for Police, Fire, and Ambulance." },
  { id: "em2", title: "Police Control Room", number: "100", department: "Police / Law & Order", description: "Direct line to local city police control room for immediate assistance." },
  { id: "em3", title: "Ambulance", number: "108", department: "Health & Medical", description: "Medical emergencies and ambulance dispatch." },
  { id: "em4", title: "BBMP Helpline (Potholes/Garbage)", number: "1533", department: "General Administration", description: "Civic amenities, garbage collection, and infrastructure complaints." },
  { id: "em5", title: "BESCOM Helpline (Electricity)", number: "1912", department: "Electricity & Power", description: "Power outage reports and electrical emergencies." },
];

// Global State
let complaints: Complaint[] = [...initialComplaints];
let users: User[] = [...initialUsers];
let admins: Admin[] = [...initialAdmins];
let circulars: Circular[] = [...initialCirculars];
let contacts: EmergencyContact[] = [...initialContacts];
let feedback: DeveloperFeedback[] = [...initialFeedback];
let currentUser: User | null = null;
let currentAdmin: Admin | null = null;

export const db = {
  // Auth
  loginUser: (email: string, password: string): User | null => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) currentUser = user;
    return user ?? null;
  },
  loginAdmin: (email: string, password: string): Admin | null => {
    const admin = admins.find(a => a.email === email && a.password === password);
    if (admin) currentAdmin = admin;
    return admin ?? null;
  },
  registerUser: (name: string, email: string, phone: string, password: string): User => {
    const newUser: User = {
      id: "u" + Date.now(), name, email, phone, password,
      points: 0, complaintsCount: 0, resolvedCount: 0,
      avatar: name.split(" ").map(n => n[0]).join("").toUpperCase(),
      joinedAt: new Date().toISOString(), rank: users.length + 1,
    };
    users.push(newUser);
    currentUser = newUser;
    return newUser;
  },
  logout: () => { currentUser = null; currentAdmin = null; },
  getCurrentUser: () => currentUser,
  getCurrentAdmin: () => currentAdmin,
  redeemTokens: (userId: string, amount: number) => {
    const user = users.find(u => u.id === userId);
    if (user && user.points >= amount) {
      user.points -= amount;
      if (currentUser?.id === user.id) currentUser = user;
      return true;
    }
    return false;
  },

  // Complaints
  getComplaints: () => complaints,
  getComplaintsByUser: (userId: string) => complaints.filter(c => c.userId === userId),
  getComplaintsByDept: (dept: string) => complaints.filter(c => c.department === dept),
  getComplaintById: (id: string) => complaints.find(c => c.id === id),
  addComplaint: (data: Omit<Complaint, "id" | "ticketId" | "blockchainHash" | "tokens" | "createdAt" | "updatedAt" | "deadline" | "escalationCount" | "upvotes" | "comments">): Complaint => {
    const textCheck = checkContentModeration(data.title + " " + data.description);
    if (!textCheck.safe) throw new Error(textCheck.reason);

    if (data.imageUrl) {
      const imgCheck = checkImageModeration(data.imageUrl);
      if (!imgCheck.safe) throw new Error(imgCheck.reason);
    }

    const complaint: Complaint = {
      ...data, id: "c" + Date.now(), ticketId: generateTicketId(), blockchainHash: generateHash(),
      tokens: data.priority === "CRITICAL" ? 200 : data.priority === "HIGH" ? 150 : data.priority === "MEDIUM" ? 100 : 50,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      deadline: new Date(Date.now() + 7 * 86400000).toISOString(),
      escalationCount: 0, upvotes: 0, comments: [],
      ...(data.isAnonymous && { userName: "Anonymous Citizen", userEmail: "hidden@lokayukta.gov", userId: "anonymous" })
    };
    complaints.unshift(complaint);
    const user = users.find(u => u.id === data.userId);
    if (user) { user.complaintsCount++; user.points += complaint.tokens; if (currentUser?.id === user.id) currentUser = user; }
    return complaint;
  },
  resolveComplaint: (id: string, resolution: string, adminId: string) => {
    const c = complaints.find(c => c.id === id);
    const a = admins.find(a => a.id === adminId);
    if (c) { c.status = "RESOLVED"; c.resolution = resolution; c.updatedAt = new Date().toISOString(); }
    if (a) { a.resolvedCount++; a.pendingCount = Math.max(0, a.pendingCount - 1); a.acrScore = Math.min(100, a.acrScore + 2); }
  },
  escalateComplaint: (id: string) => {
    const c = complaints.find(c => c.id === id);
    if (c) { c.status = "ESCALATED"; c.escalationCount++; c.updatedAt = new Date().toISOString(); }
  },
  updateComplaintStatus: (id: string, status: Complaint["status"], remarks: string) => {
    const c = complaints.find(c => c.id === id);
    if (c) { c.status = status; c.adminRemarks = remarks; c.updatedAt = new Date().toISOString(); if (status === "IN_PROGRESS") c.status = "IN_PROGRESS"; }
  },
  upvoteComplaint: (id: string) => {
    const c = complaints.find(c => c.id === id);
    if (c) c.upvotes++;
  },
  addComment: (complaintId: string, userId: string, userName: string, text: string) => {
    const c = complaints.find(c => c.id === complaintId);
    if (c) {
      c.comments.push({
        id: "cm" + Date.now(),
        userId,
        userName,
        userAvatar: userName.split(" ").map(n => n[0]).join("").toUpperCase(),
        text,
        createdAt: new Date().toISOString()
      });
    }
  },
  pressurizeComplaint: (id: string, userId: string) => {
    const c = complaints.find(c => c.id === id);
    if (c && c.userId === userId && c.status !== "RESOLVED") {
      // Upgrade priority
      if (c.priority === "LOW") c.priority = "MEDIUM";
      else if (c.priority === "MEDIUM") c.priority = "HIGH";
      else if (c.priority === "HIGH") c.priority = "CRITICAL";

      // Halve the remaining deadline
      const nowMs = Date.now();
      const deadlineMs = new Date(c.deadline).getTime();
      if (deadlineMs > nowMs) {
        const newDeadlineMs = nowMs + (deadlineMs - nowMs) / 2;
        c.deadline = new Date(newDeadlineMs).toISOString();
      }

      c.escalationCount++;
      c.status = "ESCALATED";
      c.updatedAt = new Date().toISOString();
    }
  },
  getLeaderboard: () => [...users].sort((a, b) => b.points - a.points).slice(0, 10),
  getStats: () => ({
    total: complaints.length,
    pending: complaints.filter(c => c.status === "PENDING").length,
    inProgress: complaints.filter(c => c.status === "IN_PROGRESS").length,
    resolved: complaints.filter(c => c.status === "RESOLVED").length,
    escalated: complaints.filter(c => c.status === "ESCALATED").length,
    critical: complaints.filter(c => c.priority === "CRITICAL").length,
  }),
  getAdminStats: (dept: string) => {
    const deptComplaints = complaints.filter(c => c.department === dept);
    return {
      total: deptComplaints.length,
      pending: deptComplaints.filter(c => c.status === "PENDING").length,
      inProgress: deptComplaints.filter(c => c.status === "IN_PROGRESS").length,
      resolved: deptComplaints.filter(c => c.status === "RESOLVED").length,
      escalated: deptComplaints.filter(c => c.status === "ESCALATED").length,
    };
  },

  // Circulars
  getCirculars: () => circulars,
  addCircular: (adminId: string, adminName: string, department: string, title: string, content: string) => {
    const textCheck = checkContentModeration(title + " " + content);
    if (!textCheck.safe) throw new Error(textCheck.reason);

    const newCircular: Circular = {
      id: "cir" + Date.now(),
      adminId,
      adminName,
      department,
      title,
      content,
      createdAt: new Date().toISOString()
    };
    circulars.unshift(newCircular);
    return newCircular;
  },

  // Emergency Contacts
  getContacts: () => contacts,
  addContact: (title: string, number: string, department: string, description: string) => {
    const newContact: EmergencyContact = { id: "em" + Date.now(), title, number, department, description };
    contacts.push(newContact);
    return newContact;
  },
  updateContact: (id: string, title: string, number: string, department: string, description: string) => {
    const contact = contacts.find(c => c.id === id);
    if (contact) {
      contact.title = title;
      contact.number = number;
      contact.department = department;
      contact.description = description;
    }
  },
  deleteContact: (id: string) => {
    contacts = contacts.filter(c => c.id !== id);
  },

  // Feedback
  getFeedback: () => feedback,
  addFeedback: (userId: string, userName: string, role: "CITIZEN" | "ADMIN", rating: number, comment: string, category: "BUG" | "FEATURE" | "UI" | "OTHER") => {
    const textCheck = checkContentModeration(comment);
    if (!textCheck.safe) throw new Error(textCheck.reason);

    const newFeedback: DeveloperFeedback = {
      id: "f" + Date.now(),
      userId,
      userName,
      role,
      rating,
      comment,
      category,
      createdAt: new Date().toISOString()
    };
    feedback.unshift(newFeedback);
    return newFeedback;
  }
};
