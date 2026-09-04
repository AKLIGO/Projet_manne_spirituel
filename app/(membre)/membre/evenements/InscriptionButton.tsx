"use client"

import { useState } from "react"
import { selfRegister } from "@/app/actions/registrationActions"

export default function InscriptionButton({ activityId }: { activityId: string }) {
  const [isPending, setIsPending] = useState(false)

  async function handleRegister() {
    setIsPending(true)
    const result = await selfRegister(activityId)
    
    if (result?.error) {
      alert(result.error)
      setIsPending(false)
    }
    // Si success, Next.js revalide la page et le bouton disparaitra de lui-même
  }

  return (
    <button
      onClick={handleRegister}
      disabled={isPending}
      style={{
        padding: "0.625rem 1.25rem",
        borderRadius: "50px",
        background: isPending ? "#94a3b8" : "linear-gradient(135deg, #0EA5E9, #0284C7)",
        color: "#fff",
        fontWeight: 600,
        fontSize: "0.875rem",
        border: "none",
        cursor: isPending ? "not-allowed" : "pointer",
        boxShadow: isPending ? "none" : "0 4px 12px rgba(14, 165, 233, 0.3)",
        transition: "all 0.2s ease",
      }}
    >
      {isPending ? "Inscription..." : "S'inscrire"}
    </button>
  )
}
