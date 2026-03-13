"use client";
import { motion } from "framer-motion";

export default function Logo({ size = 40, showText = true }: { size?: number, showText?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <motion.div 
        whileHover={{ rotate: 180, scale: 1.1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        style={{ 
          width: size, 
          height: size, 
          borderRadius: size / 3.5, 
          background: "linear-gradient(135deg, hsl(239, 84%, 67%), hsl(189, 94%, 43%))", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          boxShadow: `0 0 ${size / 2}px hsla(239, 84%, 67%, 0.4)`,
          cursor: "pointer",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <img 
          src="/citix_logo.png" 
          alt="CITIX Logo" 
          style={{ width: "100%", height: "100%", objectFit: "cover" }} 
        />
      </motion.div>
      {showText && (
        <div>
          <div className="text-gradient" style={{ fontSize: size * 0.5, fontWeight: 800, fontFamily: "Space Grotesk", lineHeight: 1 }}>
            CITIX
          </div>
          <div style={{ fontSize: size * 0.25, color: "#64748b", fontWeight: 700, marginTop: 2, letterSpacing: "0.15em" }}>
            CIVIC TECH
          </div>
        </div>
      )}
    </div>
  );
}
