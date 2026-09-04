import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Mes Participations – Espace Membre",
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  CONFIRMED:  { label: "Confirmée", color: "#166534", bg: "#dcfce7" },
  EN_ATTENTE: { label: "En attente", color: "#b45309", bg: "#fef3c7" },
  CANCELLED:  { label: "Annulée",   color: "#991b1b", bg: "#fee2e2" },
}

export default async function MesParticipationsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const participations = await prisma.registration.findMany({
    where: { userId: session.user.id },
    include: { activity: true },
    orderBy: { registeredAt: "desc" },
  })

  return (
    <div style={{ padding: "2rem 1.5rem", maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>Mes Participations</h1>
        <p style={{ color: "#64748b", marginTop: "0.4rem", fontSize: "0.9375rem" }}>
          Historique de vos inscriptions aux événements et activités de l'association.
        </p>
      </div>

      {participations.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📅</div>
          <h3 style={{ color: "#1e293b", fontWeight: 700, margin: "0 0 0.5rem" }}>Aucune participation</h3>
          <p style={{ color: "#64748b", fontSize: "0.9375rem", marginBottom: "1.5rem" }}>
            Vous n'êtes inscrit à aucun événement pour le moment.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {participations.map((reg) => {
            const status = statusConfig[reg.status] || { label: reg.status, color: "#64748b", bg: "#f1f5f9" }
            const date = new Date(reg.activity.startDate).toLocaleDateString("fr-FR", {
              weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
            })

            return (
              <div key={reg.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", padding: "1.5rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                <div>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#0f172a", margin: "0 0 0.25rem" }}>
                    {reg.activity.title}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.875rem", color: "#64748b" }}>
                    <span>📍 {reg.activity.location}</span>
                    <span>🕒 {date}</span>
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: "0.5rem 0 0" }}>
                    Inscrit le {new Date(reg.registeredAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: status.color, background: status.bg, padding: "6px 12px", borderRadius: "50px" }}>
                    {status.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
