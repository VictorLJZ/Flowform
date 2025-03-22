import { useState } from "react";
import { CalendarIcon, CheckSquare, FileText, ListChecks, MessageSquare, TextCursorInput, Type, FormInput, Calendar, Save } from "lucide-react";

export default function FormBuilderPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">New Form</h1>
        <div className="flex gap-2">
          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2">
            Preview
          </button>
          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
            <Save className="mr-2 h-4 w-4" />
            Save Form
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-12 gap-6">
        {/* Form builder sidebar */}
        <div className="col-span-3 bg-card rounded-xl p-6 shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Form Elements</h2>
          <p className="text-sm text-muted-foreground mb-4">Drag and drop elements to build your form</p>
          
          <div className="space-y-3">
            <div className="border rounded-md p-3 flex items-center gap-3 cursor-move hover:bg-secondary/50">
              <TextCursorInput className="h-4 w-4 text-primary" />
              <span className="text-sm">Text Field</span>
            </div>
            
            <div className="border rounded-md p-3 flex items-center gap-3 cursor-move hover:bg-secondary/50">
              <MessageSquare className="h-4 w-4 text-primary" />
              <span className="text-sm">Textarea</span>
            </div>
            
            <div className="border rounded-md p-3 flex items-center gap-3 cursor-move hover:bg-secondary/50">
              <CheckSquare className="h-4 w-4 text-primary" />
              <span className="text-sm">Checkbox</span>
            </div>
            
            <div className="border rounded-md p-3 flex items-center gap-3 cursor-move hover:bg-secondary/50">
              <ListChecks className="h-4 w-4 text-primary" />
              <span className="text-sm">Multiple Choice</span>
            </div>
            
            <div className="border rounded-md p-3 flex items-center gap-3 cursor-move hover:bg-secondary/50">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm">Date Picker</span>
            </div>
            
            <div className="border rounded-md p-3 flex items-center gap-3 cursor-move hover:bg-secondary/50">
              <Type className="h-4 w-4 text-primary" />
              <span className="text-sm">Header</span>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-md font-medium mb-3">Form Settings</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Enable form validation</span>
                <div className="h-4 w-8 bg-primary rounded-full relative">
                  <div className="absolute right-0.5 top-0.5 h-3 w-3 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Show progress bar</span>
                <div className="h-4 w-8 bg-primary rounded-full relative">
                  <div className="absolute right-0.5 top-0.5 h-3 w-3 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Allow save and continue</span>
                <div className="h-4 w-8 bg-primary/30 rounded-full relative">
                  <div className="absolute left-0.5 top-0.5 h-3 w-3 bg-white rounded-full"></div>
                </div>
              </div>
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
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              defaultValue="New Form"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Form Description</label>
            <textarea
              placeholder="Enter form description"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              defaultValue="Please fill out this form."
            />
          </div>
          
          <div className="p-4 border border-dashed rounded-lg bg-secondary/30 flex flex-col items-center justify-center min-h-[300px]">
            <FileText className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Drag form elements here to start building your form</p>
            <p className="text-muted-foreground text-sm mt-2">or</p>
            <button className="mt-3 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
              Use AI to generate form
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
