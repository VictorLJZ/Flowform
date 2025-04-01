import { notFound } from "next/navigation";
import { createClient } from "@/supabase/server";
import DataAnalysisInterface from "@/components/analytics/data-analysis-interface";

export const dynamic = 'force-dynamic';

export default async function DataAnalysisPage({ params }: { params: { formId: string } }) {
  const { formId } = params;
  
  // Validate formId is a valid UUID format
  if (!formId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    notFound();
  }
  
  const supabase = await createClient();
  
  // Fetch the form details
  const { data: form, error: formError } = await supabase
    .from('forms')
    .select('id, title, description')
    .eq('id', formId)
    .single();
    
  if (formError || !form) {
    notFound();
  }
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between py-4 border-b">
        <div>
          <h1 className="text-2xl font-bold">{form.title}</h1>
          {form.description && (
            <p className="text-muted-foreground">{form.description}</p>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        <DataAnalysisInterface formId={formId} />
      </div>
    </div>
  );
}
