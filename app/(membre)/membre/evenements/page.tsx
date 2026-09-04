import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import InscriptionButton from "./InscriptionButton"

export const metadata = {
  title: "Événements Disponibles – Espace Membre",
}

export default async function EvenementsDisponiblesPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const now = new Date()

  const activities = await prisma.activity.findMany({
    where: { startDate: { gte: now } },
    include: {
      _count: { select: { registrations: true } },
      registrations: { where: { userId: session.user.id } },
    },
    orderBy: { startDate: "asc" },
  })

  return (
    <div style={{ padding: "2rem 1.5rem", maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>Événements à venir</h1>
        <p style={{ color: "#64748b", marginTop: "0.4rem", fontSize: "0.9375rem" }}>
          Inscrivez-vous aux prochaines activités organisées par La Manne Spirituelle.
        </p>
      </div>

      {activities.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🌟</div>
          <h3 style={{ color: "#1e293b", fontWeight: 700, margin: "0 0 0.5rem" }}>Aucun événement prévu</h3>
          <p style={{ color: "#64748b", fontSize: "0.9375rem" }}>
            Revenez plus tard pour découvrir nos prochaines activités.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {activities.map((activity) => {
            const isRegistered = activity.registrations.length > 0
            const regStatus = isRegistered ? activity.registrations[0].status : null
            const date = new Date(activity.startDate).toLocaleDateString("fr-FR", {
              weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
            })
            
            const isFull = activity.maxParticipants ? activity._count.registrations >= activity.maxParticipants : false

            return (
              <div key={activity.id} style={{ display: "flex", flexDirection: "column", background: "#fff", padding: "1.5rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", marginBottom: "1rem" }}>
                  <div>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a", margin: "0 0 0.25rem" }}>
                      {activity.title}
                    </h3>
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px", fontSize: "0.875rem", color: "#64748b" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "#f1f5f9", padding: "4px 10px", borderRadius: "8px", fontWeight: 600 }}>
                        📍 {activity.location}
                      </span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "#f1f5f9", padding: "4px 10px", borderRadius: "8px", fontWeight: 600, color: "#0369a1" }}>
                        🕒 {date}
                      </span>
                      {activity.maxParticipants && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: isFull ? "#fee2e2" : "#f1f5f9", color: isFull ? "#991b1b" : "#64748b", padding: "4px 10px", borderRadius: "8px", fontWeight: 600 }}>
                          👥 {activity._count.registrations} / {activity.maxParticipants} places
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: "0.9375rem", color: "#475569", margin: "0 0 1.5rem", lineHeight: 1.6 }}>
                  {activity.description}
                </p>

                <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "1.25rem", display: "flex", justifyContent: "flex-end" }}>
                  {isRegistered ? (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "0.625rem 1.25rem", borderRadius: "50px", background: "#f8fafc", border: "1px solid #e2e8f0", color: "#64748b", fontWeight: 600, fontSize: "0.875rem" }}>
                      ✓ Déjà inscrit ({regStatus === "EN_ATTENTE" ? "En attente" : regStatus === "CONFIRMED" ? "Confirmé" : "Annulé"})
                    </div>
                  ) : isFull ? (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "0.625rem 1.25rem", borderRadius: "50px", background: "#fee2e2", color: "#991b1b", fontWeight: 600, fontSize: "0.875rem" }}>
                      Complet
                    </div>
                  ) : (
                    <InscriptionButton activityId={activity.id} />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
