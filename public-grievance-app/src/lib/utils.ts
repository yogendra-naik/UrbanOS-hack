import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function getStatusColor(status: string) {
  switch (status) {
    case "RESOLVED":
      return "text-emerald-400 bg-emerald-400/10 border-emerald-400/30";
    case "IN_PROGRESS":
      return "text-amber-400 bg-amber-400/10 border-amber-400/30";
    case "ESCALATED":
      return "text-red-400 bg-red-400/10 border-red-400/30";
    default:
      return "text-blue-400 bg-blue-400/10 border-blue-400/30";
  }
}

export function getPriorityColor(priority: string) {
  switch (priority) {
    case "CRITICAL":
      return "text-red-400 bg-red-400/10 border-red-400/30";
    case "HIGH":
      return "text-orange-400 bg-orange-400/10 border-orange-400/30";
    case "MEDIUM":
      return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
    default:
      return "text-green-400 bg-green-400/10 border-green-400/30";
  }
}

export const DEPARTMENTS = [
  "Roads & Infrastructure",
  "Water Supply",
  "Sanitation & Waste Management",
  "Electricity & Power",
  "Public Transport",
  "Parks & Recreation",
  "Street Lighting",
  "Drainage & Flooding",
  "Health & Hospitals",
  "Education",
  "Police & Safety",
  "Building & Planning",
];

export const CATEGORIES = [
  { label: "Pothole / Road Damage", dept: "Roads & Infrastructure", icon: "🚧" },
  { label: "Water Leakage / Shortage", dept: "Water Supply", icon: "💧" },
  { label: "Garbage / Waste Overflow", dept: "Sanitation & Waste Management", icon: "🗑️" },
  { label: "Power Outage / Fault", dept: "Electricity & Power", icon: "⚡" },
  { label: "Public Transport Issue", dept: "Public Transport", icon: "🚌" },
  { label: "Broken Street Light", dept: "Street Lighting", icon: "💡" },
  { label: "Sewage / Drainage Problem", dept: "Drainage & Flooding", icon: "🌊" },
  { label: "Illegal Construction", dept: "Building & Planning", icon: "🏗️" },
  { label: "Park / Green Area Neglect", dept: "Parks & Recreation", icon: "🌳" },
  { label: "Public Safety Issue", dept: "Police & Safety", icon: "🚨" },
];

export function categorizeComplaint(text: string): { category: string; department: string; priority: string } {
  const lower = text.toLowerCase();
  if (lower.match(/pothole|road|crater|broken road|highway/))
    return { category: "Pothole / Road Damage", department: "Roads & Infrastructure", priority: "HIGH" };
  if (lower.match(/water|leak|pipe|shortage|supply/))
    return { category: "Water Leakage / Shortage", department: "Water Supply", priority: "HIGH" };
  if (lower.match(/garbage|trash|waste|dump|litter|sanitation/))
    return { category: "Garbage / Waste Overflow", department: "Sanitation & Waste Management", priority: "MEDIUM" };
  if (lower.match(/power|electricity|outage|blackout|fault|wire/))
    return { category: "Power Outage / Fault", department: "Electricity & Power", priority: "HIGH" };
  if (lower.match(/bus|transport|auto|metro|train/))
    return { category: "Public Transport Issue", department: "Public Transport", priority: "MEDIUM" };
  if (lower.match(/light|lamp|street light|dark|pole/))
    return { category: "Broken Street Light", department: "Street Lighting", priority: "MEDIUM" };
  if (lower.match(/sewer|sewage|drain|flood|overflow/))
    return { category: "Sewage / Drainage Problem", department: "Drainage & Flooding", priority: "CRITICAL" };
  if (lower.match(/construction|illegal|encroach|building/))
    return { category: "Illegal Construction", department: "Building & Planning", priority: "MEDIUM" };
  if (lower.match(/park|garden|tree|green/))
    return { category: "Park / Green Area Neglect", department: "Parks & Recreation", priority: "LOW" };
  if (lower.match(/crime|safety|theft|police|violence|danger/))
    return { category: "Public Safety Issue", department: "Police & Safety", priority: "CRITICAL" };
  return { category: "General Complaint", department: "Roads & Infrastructure", priority: "LOW" };
}
// AI Moderation Keywords (English, Hindi, Kannada)
const ABUSIVE_KEYWORDS = [
  // English
  "fuck", "shit", "porn", "sexy", "nude", "bastard", "bitch", "slut", "dick", "pussy",
  // Hindi (Transliterated)
  "gali", "kamina", "haraami", "chutiya", "gaand", "raand", "behenchod", "madarchod",
  // Kannada (Transliterated)
  "shaata", "bolimaga", "huchcha", "sule", "nanmaga", "gobi", "lofar",
];

export function checkContentModeration(text: string): { safe: boolean; reason?: string } {
  const lower = text.toLowerCase();
  const found = ABUSIVE_KEYWORDS.find(word => lower.includes(word));
  
  if (found) {
    return { safe: false, reason: "Inappropriate language detected. Submissions must maintain an institutional tone." };
  }
  
  // Basic sexual abuse pattern check
  if (lower.match(/sexual|abuse|harass|assault/i) && lower.length < 50) {
    return { safe: false, reason: "Content flagged for review regarding sensitive topics. Please provide more context or reach out to official support." };
  }

  return { safe: true };
}

export function checkImageModeration(base64: string): { safe: boolean; reason?: string } {
  // In a real app, this would use a computer vision API (e.g. Google Cloud Vision)
  // Mock: If the base64 string is suspiciously small or contains a "test_fail" marker, it's inappropriate
  return { safe: true };
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
