"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, X, AlertCircle, Loader2 } from "lucide-react"
import { useAuthSession } from "@/hooks/useAuthSession"
import { acceptInvitation as acceptInvitationService } from "@/services/workspace/acceptInvitation"
import { declineInvitation as declineInvitationService } from "@/services/workspace/declineInvitation"

interface InvitePageClientProps {
  token: string
}

export function InvitePageClient({ token }: InvitePageClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isLoading: isAuthLoading } = useAuthSession()
  const userId = user?.id
  
  // Not using email state directly as it's handled by the invitation details
  // const [email, setEmail] = useState("")
  const [isValidating, setIsValidating] = useState(true)
  const [invitationDetails, setInvitationDetails] = useState<{
    email: string
    workspace: string
    role: string
    expired: boolean
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const validateInvitation = async () => {
      try {
        const supabase = createClient()
        
        // Check if user is authenticated
        const { data: authData } = await supabase.auth.getUser()
        
        if (!authData.user) {
          // Store token in localStorage and redirect to login
          localStorage.setItem('pendingInviteToken', token)
          router.push(`/login?redirect=/invite/${token}`)
          return
        }
        
        // Get invitation details
        const { data: invitation, error: invitationError } = await supabase
          .from('workspace_invitations')
          .select(`
            *,
            workspaces:workspace_id (name)
          `)
          .eq('token', token)
          .single()
        
        if (invitationError || !invitation) {
          setError("This invitation is invalid or has been revoked.")
          setIsValidating(false)
          return
        }
        
        // AuthProvider handles global user state
        
        // Check if invitation has expired
        const isExpired = new Date(invitation.expires_at) < new Date()
        
        setInvitationDetails({
          email: invitation.email,
          workspace: invitation.workspaces?.name || "Unknown Workspace",
          role: invitation.role,
          expired: isExpired
        })
        
        // Verify the email matches
        if (authData.user.email?.toLowerCase() !== invitation.email.toLowerCase()) {
          setError(`This invitation was sent to ${invitation.email}. Please log in with that email address.`)
        }
        
        setIsValidating(false)
      } catch (error) {
        console.error('Error validating invitation:', error)
        setError("An error occurred while validating this invitation.")
        setIsValidating(false)
      }
    }
    
    validateInvitation()
  }, [token, router])
  
  const handleAcceptInvitation = async () => {
    if (isAuthLoading) {
      toast({ title: "Please wait", description: "Verifying your authentication..." })
      return
    }
    if (!userId) {
      toast({ variant: "destructive", title: "Error", description: "Authentication required" })
      return
    }
    try {
      await acceptInvitationService(token, userId)
      toast({
        title: "Invitation accepted",
        description: `You have joined the "${invitationDetails?.workspace}" workspace.`,
      })
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Error accepting invitation:', error)
    }
  }
  
  const handleDeclineInvitation = async () => {
    if (isAuthLoading) {
      toast({ title: "Please wait", description: "Verifying your authentication..." })
      return
    }
    if (!userId) {
      toast({ variant: "destructive", title: "Error", description: "Authentication required" })
      return
    }
    try {
      await declineInvitationService(token)
      toast({
        title: "Invitation declined",
        description: "You have declined the invitation.",
      })
      // Redirect to homepage
      router.push('/')
    } catch (error) {
      console.error('Error declining invitation:', error)
    }
  }
  
  if (isValidating) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/40">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Validating Invitation</CardTitle>
            <CardDescription>Please wait while we validate your invitation...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    )
  }
  
  if (error || !invitationDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/40">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Invalid Invitation
            </CardTitle>
            <CardDescription>{error || "This invitation is invalid or has expired."}</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button onClick={() => router.push('/')}>Return to Homepage</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }
  
  if (invitationDetails.expired) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/40">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Invitation Expired
            </CardTitle>
            <CardDescription>
              This invitation has expired. Please contact the workspace administrator
              to request a new invitation.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button onClick={() => router.push('/')}>Return to Homepage</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Workspace Invitation</CardTitle>
          <CardDescription>
            You have been invited to join the &ldquo;{invitationDetails.workspace}&rdquo; workspace 
            as a {invitationDetails.role}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Your Email</Label>
            <Input
              id="email"
              value={invitationDetails.email}
              disabled
            />
            <p className="text-xs text-muted-foreground">
              This invitation was sent to this email address.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleDeclineInvitation}
            className="flex gap-1"
          >
            <X className="h-4 w-4" />
            Decline
          </Button>
          <Button
            onClick={handleAcceptInvitation}
            className="flex gap-1"
          >
            <CheckCircle className="h-4 w-4" />
            Accept Invitation
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
