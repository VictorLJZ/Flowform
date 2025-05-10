import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useEmbeddingProcessor } from '@/hooks/analytics/useEmbeddingProcessor';
import { Loader2 } from 'lucide-react';

interface EmbeddingProcessorProps {
  formId: string;
}

export default function EmbeddingProcessor({ formId }: EmbeddingProcessorProps) {
  const { status, isProcessing, fetchStatus, processEmbeddings } = useEmbeddingProcessor(formId);

  useEffect(() => {
    fetchStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formId]);

  const handleProcessEmbeddings = async () => {
    await processEmbeddings();
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>AI Insights Data Preparation</CardTitle>
        <CardDescription>
          Process your form responses to enable AI-powered insights and conversation analysis.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Embedding Progress</span>
            <span className="text-sm text-muted-foreground">
              {status.embedded_count} / {status.total_responses} responses
            </span>
          </div>
          <Progress value={status.embedding_percentage} className="h-2" />
          
          {status.loading ? (
            <p className="text-sm text-muted-foreground flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading embedding status...
            </p>
          ) : status.total_responses === 0 ? (
            <p className="text-sm text-muted-foreground">
              No form responses found with AI conversations. Add some responses to enable AI insights.
            </p>
          ) : status.embedding_percentage === 100 ? (
            <p className="text-sm text-green-600">
              All form responses are processed and ready for AI analysis.
            </p>
          ) : (
            <p className="text-sm text-amber-600">
              {status.embedding_percentage}% of responses are processed. Process the remaining responses to improve AI insights.
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleProcessEmbeddings}
          disabled={isProcessing || status.loading || status.total_responses === 0 || status.embedding_percentage === 100}
          className="w-full"
        >
          {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isProcessing ? 'Processing...' : 'Process Form Responses'}
        </Button>
      </CardFooter>
    </Card>
  );
} 