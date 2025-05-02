import { useState, useEffect } from 'react';
import { getLatestFormVersionWithBlocksClient } from '@/services/form/getLatestFormVersionWithBlocksClient';
import { CompleteForm } from '@/types/supabase-types';

interface UseVersionedFormReturn {
  form: CompleteForm | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch the latest version of a form with all its blocks
 * This is used by the form viewer to always show the most recent version
 */
export function useVersionedForm(id?: string): UseVersionedFormReturn {
  const [form, setForm] = useState<CompleteForm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    const fetchForm = async () => {
      try {
        setIsLoading(true);
        const formData = await getLatestFormVersionWithBlocksClient(id);
        setForm(formData);
        setError(null);
      } catch (err) {
        console.error('Error fetching versioned form:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch form'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchForm();
  }, [id]);

  return { form, isLoading, error };
}
