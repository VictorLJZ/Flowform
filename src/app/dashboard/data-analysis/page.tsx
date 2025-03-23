"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, BarChart, FileText, Calendar } from 'lucide-react';
import { useDataAnalysisStore } from '@/stores/data-analysis-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

export default function DataAnalysisPage() {
  const router = useRouter();
  const { forms, isLoading, error, fetchForms } = useDataAnalysisStore();
  
  useEffect(() => {
    fetchForms();
  }, [fetchForms]);
  
  function handleFormClick(formId: string) {
    router.push(`/dashboard/data-analysis/${formId}`);
  }
  
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Data Analysis</h1>
          <p className="text-muted-foreground">Ask questions about your form responses and get AI-powered insights</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => fetchForms()}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          Refresh
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6">
          <p>{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2" 
            onClick={() => fetchForms()}
          >
            Try Again
          </Button>
        </div>
      ) : forms.length === 0 ? (
        <div className="text-center p-12 border rounded-lg bg-muted/50">
          <BarChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No Forms Available</h3>
          <p className="text-muted-foreground mb-4">
            You need to create a form and collect responses before you can analyze data.
          </p>
          <Button onClick={() => router.push('/dashboard/forms/create')}>
            Create a Form
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => (
            <Card 
              key={form.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleFormClick(form.id)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{form.title}</CardTitle>
                  {form.isIndexed ? (
                    <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
                      Indexed
                    </Badge>
                  ) : (
                    <Badge variant="outline">Not Indexed</Badge>
                  )}
                </div>
                <CardDescription className="line-clamp-2">{form.description}</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex items-center text-sm text-muted-foreground mb-1">
                  <FileText className="h-4 w-4 mr-1" />
                  {form.responseCount} {form.responseCount === 1 ? 'response' : 'responses'}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  Last activity {formatDistanceToNow(new Date(form.lastActivity), { addSuffix: true })}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full">
                  Analyze Data
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
