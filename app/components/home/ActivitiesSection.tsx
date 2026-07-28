"use client";

import { useState } from "react";

const activities = [
  {
    id: "act-evangelisation",
    icon: "📢",
    title: "Évangélisation",
    description:
      "Partage de la Bonne Nouvelle dans les quartiers, marchés et lieux publics à travers des actions de rue et des croisades.",
    color: "#0EA5E9",
    bg: "#E0F2FE",
    tag: "Mission",
  },
  {
    id: "act-priere",
    icon: "🙏",
    title: "Prière & Adoration",
    description:
      "Réunions de prière, nuits de veille et sessions d'adoration pour fortifier la vie spirituelle de chaque membre.",
    color: "#7C3AED",
    bg: "#F3EEFF",
    tag: "Spiritualité",
  },
  {
    id: "act-bible",
    icon: "📖",
    title: "Études Bibliques",
    description:
      "Sessions régulières d'étude approfondie de la Parole de Dieu, en groupe et en sous-groupes par tranche d'âge.",
    color: "#D97706",
    bg: "#FEF3C7",
    tag: "Formation",
  },
  {
    id: "act-jeunesse",
    icon: "👶",
    title: "Ministère Jeunesse",
    description:
      "Programmes dédiés à la jeunesse : camps, activités culturelles et spirituelles pour les enfants et adolescents.",
    color: "#DB2777",
    bg: "#FDE7F3",
    tag: "Jeunesse",
  },
  {
    id: "act-entraide",
    icon: "🤝",
    title: "Entraide Sociale",
    description:
      "Aide aux familles dans le besoin, visites aux malades et aux prisonniers, distribution de vivres et de matériel.",
    color: "#0369A1",
    bg: "#E0F2FE",
    tag: "Social",
  },
  {
    id: "act-formation",
    icon: "🎓",
    title: "Formation & Leadership",
    description:
      "Formation de leaders chrétiens, ateliers de développement personnel et sessions de mentoring pour serviteurs de Dieu.",
    color: "#0284C7",
    bg: "#BAE6FD",
    tag: "Leadership",
  },
];

export default function ActivitiesSection() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section
      id="activites"
      style={{
        background: "#F9FAFB",
        padding: "100px 2rem",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <span
            style={{
              display: "inline-block",
              background: "linear-gradient(135deg, #E0F2FE, #bae6fd)",
              color: "#0EA5E9",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "2px",
              textTransform: "uppercase",
              padding: "6px 18px",
              borderRadius: "50px",
              marginBottom: "16px",
            }}
          >
            Ce Que Nous Faisons
          </span>
          <h2
            style={{
              fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
              fontWeight: 800,
              color: "#1A1A2E",
              lineHeight: 1.2,
              marginBottom: "16px",
            }}
          >
            Nos Domaines d'Activités
          </h2>
          <p
            style={{
              fontSize: "16px",
              color: "#6B7280",
              maxWidth: "520px",
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            Nous œuvrons dans plusieurs domaines pour accomplir notre mission et répondre
            aux besoins de notre communauté.
          </p>
        </div>

        {/* Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "24px",
          }}
        >
          {activities.map((act) => (
            <div
              key={act.id}
              id={act.id}
              onMouseEnter={() => setHovered(act.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: "#fff",
                borderRadius: "16px",
                padding: "28px",
                border: `1.5px solid ${hovered === act.id ? act.color : "#E5E7EB"}`,
                boxShadow:
                  hovered === act.id
                    ? `0 12px 32px rgba(0,0,0,0.1), 0 0 0 4px ${act.bg}`
                    : "0 2px 8px rgba(0,0,0,0.04)",
                transition: "all 0.3s ease",
                transform: hovered === act.id ? "translateY(-6px)" : "translateY(0)",
                cursor: "default",
              }}
            >
              {/* Icon + Tag */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    background: act.bg,
                    borderRadius: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "26px",
                    transition: "transform 0.3s ease",
                    transform: hovered === act.id ? "scale(1.1)" : "scale(1)",
                  }}
                >
                  {act.icon}
                </div>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: act.color,
                    background: act.bg,
                    padding: "4px 10px",
                    borderRadius: "50px",
                    letterSpacing: "0.5px",
                  }}
                >
                  {act.tag}
                </span>
              </div>

              {/* Text */}
              <h3
                style={{
                  fontSize: "17px",
                  fontWeight: 700,
                  color: hovered === act.id ? act.color : "#1A1A2E",
                  marginBottom: "10px",
                  transition: "color 0.2s",
                }}
              >
                {act.title}
              </h3>
              <p style={{ fontSize: "14px", color: "#6B7280", lineHeight: 1.7 }}>
                {act.description}
              </p>

              {/* Bottom bar */}
              <div
                style={{
                  marginTop: "20px",
                  height: "3px",
                  borderRadius: "2px",
                  background: hovered === act.id ? act.color : "#E5E7EB",
                  transition: "background 0.3s ease",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
