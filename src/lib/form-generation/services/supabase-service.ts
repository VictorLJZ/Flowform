import { createClient as createServerClient } from '@/supabase/server';
import { createClient as createBrowserClient } from '@/supabase/client';

/**
 * Singleton service for Supabase client management
 * Handles both server and client-side implementations
 */
export class SupabaseService {
  private static instance: SupabaseService;
  private clientPromise: Promise<any>;
  private cachedClient: any;
  private isServer: boolean;

  private constructor() {
    this.isServer = typeof window === 'undefined';
    if (this.isServer) {
      this.clientPromise = this.initServerClient();
    } else {
      this.cachedClient = createBrowserClient();
      this.clientPromise = Promise.resolve(this.cachedClient);
    }
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  /**
   * Initialize server-side client
   */
  private async initServerClient() {
    try {
      const client = await createServerClient();
      this.cachedClient = client;
      return client;
    } catch (error) {
      console.error('Failed to initialize Supabase client:', error);
      throw error;
    }
  }

  /**
   * Get the Supabase client
   * Always returns a Promise to handle both environments
   */
  public async getClient() {
    return this.clientPromise;
  }

  /**
   * Get the Supabase client synchronously if available
   * Only reliable on client-side or after first await of getClient()
   */
  public getClientSync() {
    if (!this.cachedClient) {
      throw new Error('Supabase client not initialized - call getClient() first');
    }
    return this.cachedClient;
  }
}

/**
 * Convenience function to get the Supabase client
 */
export async function getSupabaseClient() {
  return await SupabaseService.getInstance().getClient();
}
