"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Calendar, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormChat } from '@/components/analytics/form-chat';
import { supabase } from '@/supabase/supabase_client';
import { formatDistanceToNow } from 'date-fns';

interface FormDetails {
  id: string;
  title: string;
  description: string;
  responseCount: number;
  lastActivity: string;
  isIndexed: boolean;
}

export default function FormAnalysisPage() {
  const router = useRouter();
  const params = useParams();
  const formId = params?.formId as string;
  
  const [formDetails, setFormDetails] = useState<FormDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchFormDetails() {
      if (!formId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Get form details
        const { data: form, error: formError } = await supabase
          .from('forms')
          .select('id, title, description, created_at, updated_at')
          .eq('id', formId)
          .single();
          
        if (formError) throw formError;
        
        // Get response count
        const { count: responseCount, error: countError } = await supabase
          .from('form_sessions')
          .select('id', { count: 'exact', head: true })
          .eq('form_id', formId);
          
        if (countError) throw countError;
        
        // Check if form is indexed
        const { count: indexCount, error: indexError } = await supabase
          .from('form_qa_embeddings')
          .select('id', { count: 'exact', head: true })
          .eq('form_id', formId);
          
        if (indexError) throw indexError;
        
        // Get most recent activity
        const { data: latestSession, error: sessionError } = await supabase
          .from('form_sessions')
          .select('created_at')
          .eq('form_id', formId)
          .order('created_at', { ascending: false })
          .limit(1);
          
        const lastActivity = latestSession && latestSession.length > 0
          ? latestSession[0].created_at
          : form.updated_at;
        
        setFormDetails({
          id: form.id,
          title: form.title,
          description: form.description || 'No description',
          responseCount: responseCount || 0,
          lastActivity,
          isIndexed: indexCount !== null && indexCount > 0
        });
      } catch (error) {
        console.error('Error fetching form details:', error);
        setError(error instanceof Error ? error.message : 'Failed to load form details');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchFormDetails();
  }, [formId]);
  
  function handleBack() {
    router.push('/dashboard/data-analysis');
  }
  
  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6 items-center justify-center min-h-[calc(100vh-80px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error || !formDetails) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6 min-h-[calc(100vh-80px)] h-full">
        <Button variant="ghost" onClick={handleBack} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Forms
        </Button>
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          <p>{error || 'Form not found'}</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={handleBack}>
            Return to Form List
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-1 flex-col gap-6 p-6 min-h-[calc(100vh-80px)] h-full flex-grow">
      <div className="flex justify-start">
        <Button variant="ghost" onClick={handleBack} size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Forms
        </Button>
      </div>
      
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 flex-grow h-[calc(100vh-180px)]">
        <div className="lg:col-span-2 h-full flex flex-col">
          <div className="h-full">
            <FormChat formId={formId} />
          </div>
        </div>
        
        <div className="flex flex-col h-full overflow-y-auto">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-xl">Form Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-xs text-muted-foreground uppercase mb-1">Title</div>
                <div className="font-medium">{formDetails.title}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase mb-1">Description</div>
                <div className="text-sm">{formDetails.description}</div>
              </div>
            </CardContent>
          </Card>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Form Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center text-sm">
                <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>
                  {formDetails.responseCount} {formDetails.responseCount === 1 ? 'response' : 'responses'}
                </span>
              </div>
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>
                  Last activity {formatDistanceToNow(new Date(formDetails.lastActivity), { addSuffix: true })}
                </span>
              </div>
              <div className="flex items-center text-sm">
                <MessageSquare className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>
                  {formDetails.isIndexed ? 'Indexed for analysis' : 'Not yet indexed'}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="flex-1 flex flex-col">
            <CardHeader>
              <CardTitle>Chat Instructions</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3 flex-1 overflow-y-auto">
              <p>Ask questions about your form responses to gain insights.</p>
              <p>Example questions:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>What's the most common feedback from users?</li>
                <li>Summarize the key themes in responses</li>
                <li>What features are most requested?</li>
                <li>Compare positive vs negative feedback</li>
              </ul>
              <p className="mt-2">
                Responses are automatically indexed when submitted. If you have older responses that need indexing, click "Index Responses" at the top of the chat.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
