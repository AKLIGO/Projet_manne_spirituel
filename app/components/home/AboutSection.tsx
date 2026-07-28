const stats = [
  { id: "stat-membres", value: "500+", label: "Membres", icon: "👥" },
  { id: "stat-annees", value: "10+", label: "Années de ministère", icon: "📅" },
  { id: "stat-projets", value: "30+", label: "Projets réalisés", icon: "🌟" },
];

export default function AboutSection() {
  return (
    <section
      id="apropos"
      style={{
        background: "#fff",
        padding: "100px 2rem",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Section Label */}
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
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
            }}
          >
            Qui Sommes-Nous
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "60px",
            alignItems: "start",
          }}
        >
          {/* LEFT: Text */}
          <div>
            <h2
              style={{
                fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
                fontWeight: 800,
                lineHeight: 1.2,
                color: "#1A1A2E",
                marginBottom: "24px",
              }}
            >
              Une association ancrée dans{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #0EA5E9, #38BDF8)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                la foi & le service
              </span>
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <p style={{ fontSize: "16px", color: "#4B5563", lineHeight: 1.8 }}>
                Fondée sur les valeurs de l'Évangile,{" "}
                <strong>La Manne Spirituelle</strong> est une communauté chrétienne
                dynamique dédiée à la croissance spirituelle, l'entraide fraternelle et
                l'évangélisation.
              </p>
              <p style={{ fontSize: "16px", color: "#4B5563", lineHeight: 1.8 }}>
                Nous croyons en la puissance transformatrice de la Parole de Dieu et nous
                nous engageons à la vivre et à la partager avec tous. Notre mission est
                d'être un pont entre la grâce divine et les besoins humains.
              </p>
            </div>

            {/* Features */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "32px" }}>
              {[
                { icon: "📖", text: "Étude approfondie de la Bible" },
                { icon: "🙏", text: "Prière et intercession communautaire" },
                { icon: "💙", text: "Entraide et solidarité fraternelle" },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 16px",
                    background: "#F9FAFB",
                    borderRadius: "10px",
                    border: "1px solid #E5E7EB",
                  }}
                >
                  <span style={{ fontSize: "20px" }}>{item.icon}</span>
                  <span style={{ fontSize: "14px", fontWeight: 500, color: "#374151" }}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Stats Card */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Main card */}
            <div
              style={{
                background: "linear-gradient(135deg, #0369A1 0%, #0EA5E9 100%)",
                borderRadius: "20px",
                padding: "36px 32px",
                color: "#fff",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 20px 50px rgba(14,165,233,0.3)",
              }}
            >
              {/* Decorative circles */}
              <div
                style={{
                  position: "absolute",
                  top: "-30px",
                  right: "-30px",
                  width: "120px",
                  height: "120px",
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "50%",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "-50px",
                  left: "-20px",
                  width: "160px",
                  height: "160px",
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: "50%",
                }}
              />

              <p
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  opacity: 0.6,
                  marginBottom: "8px",
                }}
              >
                Notre impact
              </p>
              <p
                style={{
                  fontSize: "28px",
                  fontWeight: 900,
                  lineHeight: 1.2,
                  marginBottom: "32px",
                }}
              >
                Dieu fait des grandes choses à travers nous
              </p>

              {/* Stats Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "0",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {stats.map((stat, i) => (
                  <div
                    key={stat.id}
                    id={stat.id}
                    style={{
                      textAlign: "center",
                      padding: "16px 8px",
                      borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.15)" : "none",
                    }}
                  >
                    <div style={{ fontSize: "22px", marginBottom: "4px" }}>{stat.icon}</div>
                    <div style={{ fontSize: "28px", fontWeight: 900, lineHeight: 1 }}>
                      {stat.value}
                    </div>
                    <div
                      style={{ fontSize: "11px", opacity: 0.65, marginTop: "4px", lineHeight: 1.3 }}
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quote card */}
            <div
              style={{
                background: "#FEF9ED",
                border: "1px solid #F0C965",
                borderRadius: "16px",
                padding: "24px",
                position: "relative",
              }}
            >
              <div
                style={{
                  fontSize: "48px",
                  color: "#D4A843",
                  lineHeight: 1,
                  fontFamily: "Georgia, serif",
                  marginBottom: "8px",
                }}
              >
                "
              </div>
              <p style={{ fontSize: "15px", fontStyle: "italic", color: "#4B5563", lineHeight: 1.7 }}>
                Car là où deux ou trois sont assemblés en mon nom, je suis au milieu d'eux.
              </p>
              <p style={{ fontSize: "12px", fontWeight: 600, color: "#D4A843", marginTop: "10px" }}>
                — Matthieu 18:20
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
