"use client";
import { useRef, useState } from "react";
import { Camera } from "lucide-react";

interface ProfilePhotoUploadProps {
  photo: string;             // current base64 or ""
  initials: string;          // fallback text, e.g. "AK"
  gradient?: string;         // gradient for fallback circle
  size?: number;             // circle size in px, default 52
  onPhotoChange: (base64: string) => void;
}

export default function ProfilePhotoUpload({
  photo,
  initials,
  gradient = "linear-gradient(135deg,#6366f1,#8b5cf6)",
  size = 52,
  onPhotoChange,
}: ProfilePhotoUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [hovered, setHovered] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Photo must be under 5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => onPhotoChange(ev.target?.result as string);
    reader.readAsDataURL(file);
    // reset so the same file can be re-selected
    e.target.value = "";
  };

  return (
    <div
      style={{ position: "relative", width: size, height: size, margin: "0 auto", cursor: "pointer", flexShrink: 0 }}
      onClick={() => fileRef.current?.click()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title="Click to change profile photo"
    >
      {/* Avatar circle */}
      {photo ? (
        <img
          src={photo}
          alt="Profile"
          style={{
            width: size, height: size, borderRadius: "50%",
            objectFit: "cover", display: "block",
            border: "2px solid rgba(99,102,241,0.5)",
            boxShadow: hovered ? "0 0 0 3px rgba(99,102,241,0.35)" : "none",
            transition: "box-shadow 0.2s",
          }}
        />
      ) : (
        <div style={{
          width: size, height: size, borderRadius: "50%",
          background: gradient, display: "flex",
          alignItems: "center", justifyContent: "center",
          fontWeight: 700, fontSize: size * 0.34, color: "white",
          border: "2px solid rgba(255,255,255,0.12)",
          boxShadow: hovered ? "0 0 0 3px rgba(99,102,241,0.35)" : "none",
          transition: "box-shadow 0.2s",
          userSelect: "none",
        }}>
          {initials}
        </div>
      )}

      {/* Camera overlay on hover */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: "rgba(0,0,0,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity: hovered ? 1 : 0, transition: "opacity 0.2s",
      }}>
        <Camera size={size * 0.36} color="white" />
      </div>

      {/* Upload hint tooltip */}
      {hovered && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 8px)", left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(15,23,42,0.95)", color: "#a5b4fc",
          fontSize: 11, padding: "4px 10px", borderRadius: 7, whiteSpace: "nowrap",
          border: "1px solid rgba(99,102,241,0.3)", backdropFilter: "blur(8px)",
          pointerEvents: "none", zIndex: 10,
        }}>
          📷 Upload photo
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
    </div>
  );
}
