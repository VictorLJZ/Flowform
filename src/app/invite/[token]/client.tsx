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
import { acceptInvitation as acceptInvitationService } from "@/services/workspace/acceptInvitation"
import { declineInvitation as declineInvitationService } from "@/services/workspace/declineInvitation"
import { getWorkspaceById } from "@/services/workspace/getWorkspaceById"

interface InvitePageClientProps {
  token: string
}

// Define the invitation state types for clarity
type InvitationState = 'loading' | 'validating' | 'valid' | 'expired' | 'error'
type InvitationDetails = {
  email: string
  workspace: string
  workspaceId: string
  role: string
}

export function InvitePageClient({ token }: InvitePageClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [state, setState] = useState<InvitationState>('loading')
  const [authUser, setAuthUser] = useState<{id: string, email: string} | null>(null)
  const [invitationDetails, setInvitationDetails] = useState<InvitationDetails | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  // Single effect to handle the entire invitation validation flow
  useEffect(() => {
    async function validateInvitation() {
      try {
        console.log('Checking authentication...')
        const supabase = createClient()
        
        // Step 1: Check if user is authenticated
        const { data: authData } = await supabase.auth.getUser()
        
        if (!authData.user) {
          console.log('No authenticated user, redirecting to login')
          localStorage.setItem('pendingInviteToken', token)
          router.push(`/login?redirect=/invite/${token}`)
          return
        }
        
        // Store authentication data
        setAuthUser({
          id: authData.user.id,
          email: authData.user.email || ''
        })
        
        console.log('User authenticated, fetching invitation...')
        setState('validating')
        
        // Step 2: Get invitation details
        const { data: invitation, error: invitationError } = await supabase
          .from('workspace_invitations')
          .select(`
            *,
            workspaces:workspace_id (name)
          `)
          .eq('token', token)
          .single()
        
        // Handle invitation errors
        if (invitationError || !invitation) {
          console.error('Invalid invitation or error:', invitationError)
          setErrorMessage("This invitation is invalid or has been revoked.")
          setState('error')
          return
        }
        
        // Step 3: Check if invitation has expired
        const isExpired = new Date(invitation.expires_at) < new Date()
        
        if (isExpired) {
          console.log('Invitation has expired')
          setInvitationDetails({
            email: invitation.email,
            workspace: invitation.workspaces?.name || "Unknown Workspace",
            workspaceId: invitation.workspace_id,
            role: invitation.role
          })
          setState('expired')
          return
        }
        
        // Step 4: Check email match
        const userEmail = authData.user.email?.toLowerCase()
        const invitationEmail = invitation.email.toLowerCase()
        
        if (userEmail && userEmail !== invitationEmail) {
          console.log('Email mismatch')
          setErrorMessage(`This invitation was sent to ${invitation.email}. Please log in with that email address.`)
          setState('error')
          return
        }
        
        // Step 5: Invitation is valid
        setInvitationDetails({
          email: invitation.email,
          workspace: invitation.workspaces?.name || "Unknown Workspace",
          workspaceId: invitation.workspace_id,
          role: invitation.role
        })
        setState('valid')
        
      } catch (error) {
        console.error('Error validating invitation:', error)
        setErrorMessage("An error occurred while validating this invitation.")
        setState('error')
      }
    }

    // Start validation immediately
    validateInvitation()
    
    return () => {
      // No cleanup needed
    }
  }, [token, router])
  
  // Handle accepting invitation
  const handleAcceptInvitation = async () => {
    if (!authUser) {
      toast({ variant: "destructive", title: "Error", description: "Authentication required" })
      return
    }
    
    if (!invitationDetails) {
      toast({ variant: "destructive", title: "Error", description: "Invalid invitation" })
      return
    }
    
    try {
      // Show loading feedback
      setState('loading')
      
      // Accept the invitation through the service
      const workspace = await acceptInvitationService(token)
      
      if (workspace) {
        toast({
          title: "Invitation accepted",
          description: `You have joined the "${invitationDetails.workspace}" workspace.`,
        })
        
        try {
          // Get the workspace details
          const newWorkspace = await getWorkspaceById(workspace.id)
          console.log('Workspace joined:', newWorkspace?.name)
        } catch (error) {
          console.error('Error fetching workspace details:', error)
          // Non-blocking, still continue
        }
        
        // Redirect to dashboard
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error accepting invitation:', error)
      toast({
        variant: "destructive",
        title: "Error accepting invitation",
        description: error instanceof Error ? error.message : "An unknown error occurred"
      })
      setState('valid') // Reset to valid state to allow retry
    }
  }

  // Handle declining invitation  
  const handleDeclineInvitation = async () => {
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
      toast({
        variant: "destructive", 
        title: "Error", 
        description: "Failed to decline the invitation."
      })
    }
  }
  
  // Different UI states based on the invitation state
  if (state === 'loading' || state === 'validating') {
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
  
  if (state === 'error') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/40">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Invalid Invitation
            </CardTitle>
            <CardDescription>{errorMessage || "This invitation is invalid or has expired."}</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button onClick={() => router.push('/')}>Return to Homepage</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }
  
  if (state === 'expired') {
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
  
  // Valid invitation - show accept/decline options
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Workspace Invitation</CardTitle>
          <CardDescription>
            You have been invited to join the &ldquo;{invitationDetails?.workspace}&rdquo; workspace 
            as a {invitationDetails?.role}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Your Email</Label>
            <Input
              id="email"
              value={invitationDetails?.email || ''}
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
