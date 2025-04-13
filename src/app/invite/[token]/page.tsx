"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useWorkspaceStore } from "@/stores/workspaceStore"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, X, AlertCircle, Loader2 } from "lucide-react"

interface InvitePageProps {
  params: {
    token: string
  }
}

export default function InvitePage({ params }: InvitePageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { 
    userId, 
    setUserEmail,
    acceptInvitation, 
    declineInvitation, 
    isLoadingInvitations, 
    invitationError 
  } = useWorkspaceStore()
  
  const [email, setEmail] = useState("")
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
          localStorage.setItem('pendingInviteToken', params.token)
          router.push(`/login?redirect=/invite/${params.token}`)
          return
        }
        
        // Get invitation details
        const { data: invitation, error: invitationError } = await supabase
          .from('workspace_invitations')
          .select(`
            *,
            workspaces:workspace_id (name)
          `)
          .eq('token', params.token)
          .single()
        
        if (invitationError || !invitation) {
          setError("This invitation is invalid or has been revoked.")
          setIsValidating(false)
          return
        }
        
        // Store the user's email in the workspace store
        setUserEmail(authData.user.email || "")
        
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
  }, [params.token, router, setUserEmail])
  
  const handleAcceptInvitation = async () => {
    try {
      const result = await acceptInvitation(params.token)
      
      if (result) {
        toast({
          title: "Invitation accepted",
          description: `You have joined the "${invitationDetails?.workspace}" workspace.`,
        })
        
        // Redirect to dashboard
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error accepting invitation:', error)
    }
  }
  
  const handleDeclineInvitation = async () => {
    try {
      const result = await declineInvitation(params.token)
      
      if (result) {
        toast({
          title: "Invitation declined",
          description: "The invitation has been declined.",
        })
        
        // Redirect to dashboard or homepage
        router.push('/')
      }
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
            You have been invited to join the "{invitationDetails.workspace}" workspace 
            as a {invitationDetails.role}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {invitationError && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
              {invitationError}
            </div>
          )}
          
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
            disabled={isLoadingInvitations}
            className="flex gap-1"
          >
            <X className="h-4 w-4" />
            Decline
          </Button>
          <Button
            onClick={handleAcceptInvitation}
            disabled={isLoadingInvitations}
            className="flex gap-1"
          >
            {isLoadingInvitations ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            Accept Invitation
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
