import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { dbToApiProfile } from '@/utils/type-utils/user';

// Get a user's profile
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    const supabase = await createClient();
    
    // If no userId is provided, get the current user
    let targetUserId = userId;
    if (!targetUserId) {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        return NextResponse.json(
          { error: 'Not authenticated and no user ID provided' },
          { status: 401 }
        );
      }
      targetUserId = userData.user.id;
    }

    // Get the profile
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', targetUserId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Profile not found
        return NextResponse.json(null);
      }
      console.error('[API] Error fetching user profile:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Transform the database data to API format
    const apiProfile = dbToApiProfile(data);
    return NextResponse.json(apiProfile);
  } catch (error: unknown) {
    console.error('[API] Error in user profile API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}
