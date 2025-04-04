import { SupabaseService } from './supabase-service';

/**
 * Base service class with Supabase client handling
 */
export abstract class BaseService {
  protected supabase: any;
  private clientInitialized: boolean = false;

  constructor() {
    this.supabase = null;
  }

  /**
   * Initialize the Supabase client
   * Must be called at the beginning of every public method
   */
  protected async initClient() {
    if (!this.clientInitialized) {
      this.supabase = await SupabaseService.getInstance().getClient();
      this.clientInitialized = true;
    }
    return this.supabase;
  }
}
