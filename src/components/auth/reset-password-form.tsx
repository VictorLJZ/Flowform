"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updatePassword } from "@/app/login/actions"
import { useState } from "react"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleUpdatePassword(formData: FormData) {
    // Validate passwords match
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string
    
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "Please make sure both passwords match.",
      })
      return
    }
    
    setIsLoading(true)
    try {
      const result = await updatePassword(formData)
      
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        })
      } else {
        toast({
          title: "Password updated",
          description: "Your password has been updated successfully.",
        })
        router.push('/login?message=Your password has been updated. Please login with your new password.')
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
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Reset your password</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter a new password for your account
        </p>
      </div>
      
      <form action={handleUpdatePassword} className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="password">New Password</Label>
          <Input name="password" id="password" type="password" required />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input name="confirmPassword" id="confirmPassword" type="password" required />
        </div>
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          Reset password
        </Button>
        
        <div className="text-center text-sm">
          <Link href="/login" className="underline underline-offset-4">
            Back to login
          </Link>
        </div>
      </form>
    </div>
  )
} 