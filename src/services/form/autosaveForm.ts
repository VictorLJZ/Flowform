import { useFormBuilderStore } from '@/stores/formBuilderStore';

// Default debounce time in milliseconds
const DEFAULT_DEBOUNCE_TIME = 1500;

/**
 * AutosaveService provides functionality to automatically save form changes
 * with debouncing to prevent excessive API calls
 */
class AutosaveService {
  private saveTimeout: ReturnType<typeof setTimeout> | null = null;
  private debounceTime: number;
  
  constructor(debounceTime: number = DEFAULT_DEBOUNCE_TIME) {
    this.debounceTime = debounceTime;
    this.debouncedSave = this.debounce(this.performSave, this.debounceTime);
  }
  
  /**
   * Utility function to debounce method calls
   */
  private debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    
    return (...args: Parameters<T>): void => {
      const later = () => {
        timeout = null;
        func(...args);
      };
      
      if (timeout) {
        clearTimeout(timeout);
      }
      
      timeout = setTimeout(later, wait);
    };
  }
  
  /**
   * Schedule an autosave with debouncing
   * This will cancel any pending save and schedule a new one
   */
  public scheduleAutosave(): void {
    this.debouncedSave();
  }
  
  /**
   * Perform the actual save operation
   * This method is debounced to prevent excessive saves
   */
  private performSave = async (): Promise<void> => {
    try {
      // Get the current store state and save method
      const { saveForm } = useFormBuilderStore.getState();
      
      // Call the store's save method
      await saveForm();
      console.log('Form autosaved successfully');
    } catch (error) {
      console.error('Autosave failed:', error);
    }
  };
  
  /**
   * Cancel any pending autosave operation
   * Useful when navigating away or performing a manual save
   */
  public cancelPendingSave(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }
  }
  
  /**
   * Debounced save method
   * Will be replaced with the debounced version in constructor
   */
  private debouncedSave: () => void = () => {};
}

// Create a singleton instance of the autosave service
export const autosaveService = new AutosaveService();

/**
 * Hook to easily access the autosaveService in React components
 */
export function useAutosave() {
  return autosaveService;
}
