"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

// This is a redirect page that ensures /dashboard/forms/builder routes to the form builder with a new form
export default function FormBuilderRedirectPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to the "new" form builder page
    router.replace("/dashboard/forms/builder/new")
  }, [router])
  
  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="animate-pulse">Loading form builder...</div>
    </div>
  )
}
