import Link from "next/link";
import { notFound } from "next/navigation";

// Define the static data for the projects
const projectData: Record<string, { title: string; subtitle: string; description: string; icon: string }> = {
  evangelisations: {
    title: "Les Évangélisations",
    subtitle: "Répandre la Bonne Nouvelle",
    description: "Nous organisons des campagnes d'évangélisation dans les rues, les quartiers et les villages pour apporter le message de paix, d'amour et de salut de Jésus-Christ à tous ceux qui en ont besoin. Notre approche se veut respectueuse et pleine d'amour fraternel.",
    icon: "📢",
  },
  croisades: {
    title: "Les Croisades",
    subtitle: "Grands rassemblements spirituels",
    description: "Les croisades sont des événements majeurs où nous réunissons plusieurs communautés pour prier, louer et partager la parole de Dieu. Ces rencontres sont des moments forts de guérison spirituelle, de témoignages et de transformation de vies.",
    icon: "🕊️",
  },
  conferences: {
    title: "Conférences Réalisées",
    subtitle: "Édification et enseignement",
    description: "Nos conférences thématiques visent à équiper les croyants pour faire face aux défis contemporains. Des orateurs inspirants abordent des sujets variés tels que le leadership chrétien, l'harmonie familiale, et la gestion financière selon les principes bibliques.",
    icon: "🎤",
  },
  agropastoral: {
    title: "Projet Agropastoral",
    subtitle: "Soutenir la communauté par le travail de la terre",
    description: "Ce projet vise à créer une ferme communautaire pour assurer une sécurité alimentaire tout en offrant des opportunités de formation professionnelle aux jeunes. Il symbolise notre engagement envers le développement durable et l'autonomie financière de notre communauté.",
    icon: "🌱",
  },
};

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  // Await the params object in Next.js 15+ (assuming Next.js 15 App Router convention)
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const project = projectData[slug];

  if (!project) {
    notFound();
  }

  return (
    <main style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* Hero Section */}
      <section
        style={{
          padding: "160px 2rem 80px",
          background: "linear-gradient(135deg, #0369A1 0%, #0EA5E9 100%)",
          color: "#fff",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>{project.icon}</div>
          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 4rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: "16px",
            }}
          >
            {project.title}
          </h1>
          <p style={{ fontSize: "1.25rem", opacity: 0.9, fontWeight: 500 }}>
            {project.subtitle}
          </p>
        </div>
        
        {/* Decorative elements */}
        <div style={{ position: "absolute", top: "10%", left: "5%", width: "200px", height: "200px", background: "rgba(255,255,255,0.05)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: "-10%", right: "5%", width: "300px", height: "300px", background: "rgba(255,255,255,0.05)", borderRadius: "50%" }} />
      </section>

      {/* Content Section */}
      <section style={{ padding: "80px 2rem" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div
            style={{
              background: "#fff",
              padding: "40px",
              borderRadius: "16px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.05)",
            }}
          >
            <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#1A1A2E", marginBottom: "24px" }}>
              À propos de ce projet
            </h2>
            <p style={{ fontSize: "18px", color: "#4B5563", lineHeight: 1.8 }}>
              {project.description}
            </p>

            <div style={{ marginTop: "40px", display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <Link
                href="/#apropos"
                style={{
                  display: "inline-block",
                  padding: "12px 24px",
                  background: "#f1f5f9",
                  color: "#334155",
                  fontWeight: 600,
                  textDecoration: "none",
                  borderRadius: "8px",
                  transition: "background 0.2s ease",
                }}
              >
                ← Retour à l'accueil
              </Link>
              <Link
                href="/#contact"
                style={{
                  display: "inline-block",
                  padding: "12px 24px",
                  background: "linear-gradient(135deg, #0EA5E9, #38BDF8)",
                  color: "#fff",
                  fontWeight: 600,
                  textDecoration: "none",
                  borderRadius: "8px",
                  boxShadow: "0 4px 14px rgba(14,165,233,0.3)",
                }}
              >
                Soutenir ce projet
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
