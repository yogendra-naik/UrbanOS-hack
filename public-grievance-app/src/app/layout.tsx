import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GrievanceOS – Build for Bengaluru | Citizen Complaint Platform",
  description: "AI-powered public grievance management for smarter, responsive governance in Bengaluru. File complaints, track resolution, earn civic tokens.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div style={{ position: "relative", zIndex: 1 }}>
          {children}
        </div>
      </body>
    </html>
  );
}
