"use client"

import { ReactNode } from "react"

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  badgeText?: string
  badgeType?: "success" | "warning" | "info" | "neutral"
  icon: ReactNode
  gradient?: string
}

export default function StatCard({
  title,
  value,
  subtitle,
  badgeText,
  badgeType = "info",
  icon,
  gradient = "linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)",
}: StatCardProps) {
  const badgeStyles = {
    success: { bg: "#f0fdf4", color: "#166534", border: "#bbf7d0" },
    warning: { bg: "#fffbeb", color: "#92400e", border: "#fde68a" },
    info: { bg: "#e0f2fe", color: "#0369a1", border: "#bae6fd" },
    neutral: { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" },
  }[badgeType]

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "18px",
        padding: "1.5rem",
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      className="stat-card"
    >
      {/* Top Accent Line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: gradient,
        }}
      />

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: "1rem" }}>
        <div>
          <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {title}
          </span>
          <h3 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", margin: "0.375rem 0 0", lineHeight: 1.2 }}>
            {value}
          </h3>
        </div>

        <div
          style={{
            width: "46px",
            height: "46px",
            borderRadius: "12px",
            background: gradient,
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(14, 165, 233, 0.3)",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      </div>

      {(subtitle || badgeText) && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingTop: "0.75rem", borderTop: "1px solid #f8fafc", fontSize: "0.8125rem" }}>
          {badgeText && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "2px 8px",
                borderRadius: "50px",
                background: badgeStyles.bg,
                color: badgeStyles.color,
                border: `1px solid ${badgeStyles.border}`,
                fontSize: "0.75rem",
                fontWeight: 700,
              }}
            >
              {badgeText}
            </span>
          )}
          {subtitle && (
            <span style={{ color: "#64748b" }}>
              {subtitle}
            </span>
          )}
        </div>
      )}

      <style>{`
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08) !important;
        }
      `}</style>
    </div>
  )
}
