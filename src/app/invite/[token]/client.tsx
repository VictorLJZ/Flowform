"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { useAuth, useSupabase } from "@/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, X, AlertCircle, Loader2 } from "lucide-react"

interface InvitePageClientProps {
  token: string
}

// Define the invitation state types for clarity
type InvitationState = 'loading' | 'validating' | 'valid' | 'expired' | 'error'

// Define the RPC function result type
type ValidatedInvitation = {
  id: string
  workspace_id: string
  email: string
  role: string
  status: string
  invited_at: string
  expires_at: string
  token: string
  workspace_name: string
}

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
  const [invitationDetails, setInvitationDetails] = useState<InvitationDetails | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [validationAttempted, setValidationAttempted] = useState(false)
  
  // Get auth context and Supabase client from the existing provider
  const { user, isLoading: authLoading } = useAuth()
  const supabase = useSupabase()

  // Effect to run when auth state changes or on first load
  useEffect(() => {
    async function validateInvitation() {
      try {
        // Do not re-validate if we're in a valid state and have invitation details
        if (state === 'valid' && invitationDetails !== null) {
          return
        }

        console.log('=== STARTING INVITATION VALIDATION ===')
        console.log('Token being validated:', token)
        console.log('Auth state:', { user: user?.id, authLoading })
        setValidationAttempted(true)
        
        // Step 1: Check if user is authenticated
        if (authLoading) {
          console.log('Auth is still loading, waiting...')
          setState('loading') // Make sure we're in loading state
          return // Exit early, will retry when auth state changes
        }
        
        if (!user) {
          console.log('No authenticated user, redirecting to login')
          localStorage.setItem('pendingInviteToken', token)
          router.push(`/login?redirect=/invite/${token}`)
          return
        }
        
        // Log authentication data
        console.log('User authenticated:', { id: user.id, email: user.email })
        
        console.log('Starting invitation validation via RPC...')
        setState('validating')
        
        // Debug: Verify the token parameter
        console.log('Calling RPC with token parameter:', { p_token: token })
        
        // Step 2: Use RPC function to validate the invitation
        console.log('Attempting RPC call to validate_invitation_by_token...')
        console.time('RPC call duration')
        
        const { data, error } = await supabase
          .rpc('validate_invitation_by_token', { p_token: token })
          .single()
          
        console.timeEnd('RPC call duration')
        console.log('RPC result:', { data, error })
        
        // Log the raw results
        console.log('RPC result:', { data, error })
        

        
        // Handle invitation errors
        if (error) {
          console.error('Validation error:', error)
          setErrorMessage(error?.message || "This invitation is invalid or has expired.")
          setState('error')
          return
        }
        
        if (!data) {
          console.error('No data returned from RPC function')
          setErrorMessage("This invitation is invalid or has expired.")
          setState('error')
          return
        }
        
        // Cast the data to our type
        const invitation = data as ValidatedInvitation
        console.log('Validated invitation data:', invitation)
        
        // Step 3: Check email match
        const userEmail = user.email?.toLowerCase()
        const invitationEmail = invitation.email.toLowerCase()
        
        if (userEmail && userEmail !== invitationEmail) {
          console.log('Email mismatch')
          setErrorMessage(`This invitation was sent to ${invitation.email}. Please log in with that email address.`)
          setState('error')
          return
        }
        
        // Step 4: Invitation is valid
        setInvitationDetails({
          email: invitation.email,
          workspace: invitation.workspace_name || "Unknown Workspace",
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
    // Only run validation if auth has loaded or if we haven't attempted validation yet
    if (!authLoading || !validationAttempted) {
      validateInvitation()
    }
  }, [token, router, supabase, user, authLoading, validationAttempted, state, invitationDetails])

  // Handle accepting invitation
  const handleAcceptInvitation = async () => {
    if (!user) {
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
      
      // Accept the invitation through the API endpoint
      const response = await fetch(`/api/invitations/${token}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to accept invitation')
      }
    
      
      toast({
        title: "Invitation accepted",
        description: `You have joined the "${invitationDetails.workspace}" workspace.`,
      })
      
      // Redirect to dashboard
      router.push('/dashboard/workspace/' + invitationDetails.workspaceId)
    } catch (error) {
      console.error('Error accepting invitation:', error)
      setState('valid') // Reset state to allow retry
      toast({
        variant: "destructive",
        title: "Error accepting invitation",
        description: error instanceof Error ? error.message : "Failed to accept the invitation."
      })
    }
  }

  // Handle declining invitation  
  const handleDeclineInvitation = async () => {
    try {
      // Decline invitation through API endpoint
      const response = await fetch(`/api/invitations/${token}/decline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to decline invitation')
      }
      
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
        description: error instanceof Error ? error.message : "Failed to decline the invitation."
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
