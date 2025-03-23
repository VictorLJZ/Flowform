"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface FormInsightsProps {
  formId: string;
}

export function FormInsights({ formId }: FormInsightsProps) {
  const [insights, setInsights] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  async function fetchInsights() {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/forms/${formId}/insights`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch insights');
      }
      
      const data = await response.json();
      setInsights(data.insights);
    } catch (error) {
      console.error('Error fetching insights:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="font-medium">Form Insights</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchInsights}
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          {loading ? 'Generating...' : 'Generate Insights'}
        </Button>
      </div>
      
      <div className="p-4">
        {error ? (
          <div className="text-red-500">
            <p>Error: {error}</p>
          </div>
        ) : insights ? (
          <div className="prose max-w-none">
            {insights.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <p>Click "Generate Insights" to analyze your form responses.</p>
          </div>
        )}
      </div>
    </div>
  );
}
