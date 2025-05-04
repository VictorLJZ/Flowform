"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { resetPassword } from "@/app/login/actions"
import { useState } from "react"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  async function handleResetPassword(formData: FormData) {
    setIsLoading(true)
    try {
      const result = await resetPassword(formData)
      
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        })
      } else {
        setEmailSent(true)
        toast({
          title: "Check your email",
          description: "We've sent you an email with a link to reset your password.",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6")}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Reset your password</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your email below and we'll send you a link to reset your password
        </p>
      </div>
      
      {!emailSent ? (
        <form action={handleResetPassword} className={cn("grid gap-6", className)} {...props}>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input name="email" id="email" type="email" placeholder="m@example.com" required />
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            Send reset link
          </Button>
          
          <div className="text-center text-sm">
            Remember your password?{" "}
            <Link href="/login" className="underline underline-offset-4">
              Back to login
            </Link>
          </div>
        </form>
      ) : (
        <div className="grid gap-6">
          <div className="rounded-md bg-green-500/15 p-3 text-sm text-green-600">
            Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder.
          </div>
          
          <Button asChild className="w-full">
            <Link href="/login">
              Back to login
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
} 