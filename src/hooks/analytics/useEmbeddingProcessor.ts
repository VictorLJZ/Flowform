import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface EmbeddingStatus {
  total_responses: number;
  embedded_count: number;
  embedding_percentage: number;
  loading?: boolean;
}

interface EmbeddingProcessResult {
  success: boolean;
  processed: number;
  skipped: number;
  errors: number;
}

export function useEmbeddingProcessor(formId: string) {
  const [status, setStatus] = useState<EmbeddingStatus>({
    total_responses: 0,
    embedded_count: 0,
    embedding_percentage: 0,
    loading: true
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  /**
   * Fetch the current embedding status for the form
   */
  const fetchStatus = async () => {
    try {
      setStatus(prev => ({ ...prev, loading: true }));
      
      const response = await fetch(`/api/analytics/embeddings/process?formId=${formId}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch embedding status');
      }
      
      const data = await response.json();
      setStatus({
        ...data,
        loading: false
      });
      
      return data;
    } catch (error) {
      console.error('Error fetching embedding status:', error);
      setStatus(prev => ({ ...prev, loading: false }));
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch embedding status',
        variant: 'destructive'
      });
      return null;
    }
  };

  /**
   * Process embeddings for the form
   */
  const processEmbeddings = async () => {
    try {
      setIsProcessing(true);
      
      const response = await fetch('/api/analytics/embeddings/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ formId })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process embeddings');
      }
      
      const result: EmbeddingProcessResult = await response.json();
      
      toast({
        title: 'Embeddings processed',
        description: `Processed ${result.processed} conversations, skipped ${result.skipped}, errors: ${result.errors}`
      });
      
      // Refresh status after processing
      await fetchStatus();
      
      return result;
    } catch (error) {
      console.error('Error processing embeddings:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process embeddings',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    status,
    isProcessing,
    fetchStatus,
    processEmbeddings
  };
} 