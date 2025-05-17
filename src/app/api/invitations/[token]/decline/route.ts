/**
 * API Route for declining a workspace invitation
 * 
 * POST /api/invitations/[token]/decline - Decline an invitation
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import * as invitationsService from '@/services/workspace/invitations.server';

/**
 * Extract the invitation token from the params
 */
interface Params {
  params: {
    token: string;
  };
}

/**
 * POST handler - decline invitation
 */
export async function POST(
  request: Request, 
  { params }: { params: Promise<{ token: string }> | { token: string } }
) {
  // Next.js 15 pattern for handling dynamic route params - we need to await the params object
  const resolvedParams = 'then' in params ? await params : params;
  const token = resolvedParams.token;
  
  try {
    
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get invitation by token
    const invitation = await invitationsService.getInvitationByToken(token);
    
    // If invitation not found
    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }
    
    // If invitation already has a final status
    if (invitation.status !== 'pending') {
      return NextResponse.json(
        { error: `Invitation has already been ${invitation.status}` },
        { status: 400 }
      );
    }
    
    // If expired, mark as expired instead of declined
    if (invitationsService.isInvitationExpired(invitation)) {
      await invitationsService.updateInvitationStatus(invitation.id, 'expired');
      
      return NextResponse.json(
        { success: true, message: 'Invitation has expired' }
      );
    }
    
    // Validate email matches (case insensitive)
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single();
    
    if (!profile || !profile.email || profile.email.toLowerCase() !== invitation.email.toLowerCase()) {
      return NextResponse.json(
        { error: 'This invitation was sent to a different email address' },
        { status: 403 }
      );
    }
    
    // Mark invitation as declined
    await invitationsService.updateInvitationStatus(invitation.id, 'declined');
    
    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error(`Error declining invitation:`, error);
    return NextResponse.json(
      { error: `Failed to decline invitation: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
