import { createClient } from '@/lib/supabase/client';
import { Workspace } from '@/types/supabase-types';
import { getUserWorkspaces } from './getUserWorkspaces';
import { createWorkspace } from './createWorkspace';

// Keep track of initialization in progress
let initializationInProgress: Record<string, Promise<any>> = {};

/**
 * Ensures a user has at least one workspace by creating a default one if none exists
 * 
 * @param userId - The ID of the user to initialize a workspace for
 * @returns The user's default workspace (either existing or newly created)
 */
export async function initializeDefaultWorkspace(userId: string): Promise<Workspace | null> {
  // If initialization is already in progress for this user, wait for it to complete
  if (userId in initializationInProgress) {
    console.log('Initialization already in progress for user:', userId, 'waiting for it to complete');
    try {
      await initializationInProgress[userId];
      // After the previous initialization completes, fetch the workspaces
      const existingWorkspaces = await getUserWorkspaces(userId);
      if (existingWorkspaces.length > 0) {
        return existingWorkspaces[0];
      }
    } catch (error) {
      console.error('Error waiting for existing initialization:', error);
      // Continue with a new initialization attempt
    }
  }

  // Create a promise for this initialization
  let promiseResolve!: (value: any) => void;
  let promiseReject!: (reason?: any) => void;
  
  const initPromise = new Promise<any>((resolve, reject) => {
    promiseResolve = resolve;
    promiseReject = reject;
  });
  
  // Store the promise for this initialization
  initializationInProgress[userId] = initPromise;

  try {
    console.log('Initializing default workspace for user:', userId);
    
    // First check if the user already has any workspaces
    try {
      const existingWorkspaces = await getUserWorkspaces(userId);
      console.log('Existing workspaces:', existingWorkspaces);
      
      // If user already has workspaces, return the first one
      if (existingWorkspaces.length > 0) {
        console.log('User already has workspaces, returning first one:', existingWorkspaces[0]);
        promiseResolve(existingWorkspaces[0]);
        return existingWorkspaces[0];
      }
    } catch (error) {
      console.error('Error while checking existing workspaces:', error);
      promiseReject(error);
      throw error;
    }
    
    // Get user information for personalizing the workspace name
    console.log('Getting user information for workspace name');
    const supabase = createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    console.log('User data response:', { data: userData, error: userError });
    
    if (!userData?.user) {
      console.error('User not authenticated');
      const error = new Error('User not authenticated');
      promiseReject(error);
      throw error;
    }
    
    // Create a default workspace name based on user information
    const userDisplayName = 
      userData.user.user_metadata?.name || 
      userData.user.user_metadata?.full_name || 
      userData.user.email?.split('@')[0] || 
      'User';
    
    const defaultWorkspaceName = `${userDisplayName}'s Workspace`;
    
    // Create the default workspace
    console.log('Creating default workspace with name:', defaultWorkspaceName);
    try {
      const newWorkspace = await createWorkspace({
        name: defaultWorkspaceName,
        description: 'My default workspace',
        created_by: userId,
        logo_url: null,
        settings: null
      });
      
      console.log('Successfully created workspace:', newWorkspace);
      promiseResolve(newWorkspace);
      return newWorkspace;
    } catch (createError) {
      console.error('Error creating default workspace:', createError);
      promiseReject(createError);
      throw createError;
    }
  } catch (error) {
    console.error('Error initializing default workspace:', error);
    // Log the full error object and stack trace
    console.error('Full error:', JSON.stringify(error, null, 2));
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
    promiseReject(error);
    return null;
  } finally {
    // Remove the initialization promise once complete
    delete initializationInProgress[userId];
  }
}
