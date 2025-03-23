"use client"

import { useState } from "react";
import { MessageSquare, BrainCircuit, Thermometer, Hash, Save, Eye, Check } from "lucide-react";
import { FormGenerationConfig } from "../../../../types/form-generation";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export default function FormBuilderPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [formConfig, setFormConfig] = useState<FormGenerationConfig & { title: string; description: string }>({
    starterQuestion: "What's your favorite hobby and why do you enjoy it?",
    instructions: "Create a conversational form that explores the person's interests and hobbies in depth. Ask follow-up questions that help understand their motivations and experiences.",
    temperature: 0.7,
    maxQuestions: 5,
    title: "New Conversational Form",
    description: "A dynamic form that adapts to user responses"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const handleInputChange = (field: string, value: string | number) => {
    setFormConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveForm = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formConfig),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save form');
      }
      
      toast({
        title: "Form saved",
        description: "Your conversational form has been saved successfully.",
      });
      
      // Navigate to the form list after successful save
      router.push('/dashboard/forms');
    } catch (error) {
      console.error('Error saving form:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to save form. Please try again.',
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  const togglePreview = () => {
    setPreviewMode(!previewMode);
  };

  return (
    <div className="flex flex-col gap-6 p-6 w-full h-[calc(100vh-4rem)] overflow-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">New Conversational Form</h1>
        <div className="flex gap-2">
          <button 
            onClick={togglePreview}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2"
          >
            {previewMode ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Exit Preview
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </>
            )}
          </button>
          <button 
            onClick={handleSaveForm}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Saving..." : "Save Form"}
          </button>
        </div>
      </div>
      
      {previewMode ? (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-card rounded-xl p-6 shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">{formConfig.title}</h2>
            <p className="text-muted-foreground mb-6">{formConfig.description}</p>
            
            <div className="border rounded-lg p-6 mb-4">
              <p className="text-lg font-medium mb-2">Question:</p>
              <p className="text-gray-700">{formConfig.starterQuestion}</p>
              
              <div className="mt-6">
                <p className="text-sm font-medium mb-2">Your Answer:</p>
                <textarea 
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
                  placeholder="Type your response here..."
                  disabled
                />
                <div className="mt-4 flex justify-end">
                  <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                    Continue
                  </button>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">This is a preview of how your form will appear to users. The AI will automatically generate follow-up questions based on user responses.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-6">
          {/* Form configuration sidebar */}
          <div className="col-span-3 bg-card rounded-xl p-6 shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">Configuration</h2>
            <p className="text-sm text-muted-foreground mb-4">Customize how your conversational form works</p>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Max Questions</span>
                </div>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formConfig.maxQuestions}
                  onChange={(e) => {
                    const value = e.target.value === '' ? '' : parseInt(e.target.value);
                    handleInputChange('maxQuestions', value === '' ? 5 : value);
                  }}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <p className="text-xs text-muted-foreground">Number of questions in the conversation (1-20)</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Temperature</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={formConfig.temperature}
                    onChange={(e) => {
                      const value = e.target.value === '' ? '' : parseFloat(e.target.value);
                      handleInputChange('temperature', value === '' ? 0.7 : value);
                    }}
                    className="flex-1"
                  />
                  <span className="text-sm font-mono bg-secondary px-2 py-1 rounded">{formConfig.temperature}</span>
                </div>
                <p className="text-xs text-muted-foreground">Controls randomness in AI responses (0.0-1.0)</p>
              </div>
            </div>
          </div>
          
          {/* Form builder canvas */}
          <div className="col-span-9 bg-card rounded-xl p-6 shadow-sm border">
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Form Title</label>
              <input
                type="text"
                placeholder="Enter form title"
                value={formConfig.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Form Description</label>
              <textarea
                placeholder="Enter form description"
                value={formConfig.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                <label className="text-sm font-medium">Starter Question</label>
              </div>
              <textarea
                placeholder="Enter the first question to ask users"
                value={formConfig.starterQuestion}
                onChange={(e) => handleInputChange('starterQuestion', e.target.value)}
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p className="text-xs text-muted-foreground mt-1">This is the first question users will see when starting your form</p>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <BrainCircuit className="h-4 w-4 text-primary" />
                <label className="text-sm font-medium">AI Instructions</label>
              </div>
              <textarea
                placeholder="Provide instructions for how the AI should generate follow-up questions"
                value={formConfig.instructions}
                onChange={(e) => handleInputChange('instructions', e.target.value)}
                className="flex min-h-[220px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p className="text-xs text-muted-foreground mt-1">These instructions guide how the AI generates follow-up questions based on user responses</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
