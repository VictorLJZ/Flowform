"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GalleryVerticalEnd } from "lucide-react"

export default function FormsLandingPage() {
  const router = useRouter()
  const [formId, setFormId] = useState("")
  const [error, setError] = useState("")
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formId.trim()) {
      setError("Please enter a form ID")
      return
    }
    
    // Navigate to the form
    router.push(`/f/${formId}`)
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            <span className="font-semibold text-xl">FlowForm</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign up</Button>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 border">
          <h1 className="text-2xl font-bold text-center mb-2">Access a Form</h1>
          <p className="text-center text-gray-600 mb-6">
            Enter the form ID below to access and complete a specific form
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                value={formId}
                onChange={(e) => {
                  setFormId(e.target.value)
                  setError("")
                }}
                placeholder="Enter form ID"
                className={error ? "border-red-500" : ""}
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
            
            <Button type="submit" className="w-full">
              Access Form
            </Button>
          </form>
          
          <div className="mt-6 pt-6 border-t text-center">
            <p className="text-sm text-gray-600">
              Need to create your own forms?{" "}
              <Link href="/signup" className="text-primary font-medium">
                Sign up for an account
              </Link>
            </p>
          </div>
        </div>
        
        <div className="mt-12 max-w-2xl text-center">
          <h2 className="text-xl font-semibold mb-4">About Public Forms</h2>
          <p className="text-gray-600">
            FlowForm allows you to create dynamic, AI-powered forms and share them with anyone.
            Recipients can access and complete these forms without needing an account.
            Just share the form ID or direct link with them.
          </p>
        </div>
      </main>
      
      <footer className="bg-white py-6 border-t">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} FlowForm. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
