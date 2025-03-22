import { FileText, Plus } from "lucide-react"

export default function FormsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Forms</h1>
        <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
          <Plus className="mr-2 h-4 w-4" />
          Create New Form
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { id: 1, title: "Customer Feedback", responses: 42, created: "2025-03-15" },
          { id: 2, title: "Event Registration", responses: 18, created: "2025-03-10" },
          { id: 3, title: "Product Survey", responses: 56, created: "2025-03-05" },
          { id: 4, title: "Job Application", responses: 12, created: "2025-02-28" },
          { id: 5, title: "Newsletter Signup", responses: 120, created: "2025-02-20" },
          { id: 6, title: "Contact Form", responses: 8, created: "2025-02-15" },
        ].map((form) => (
          <div key={form.id} className="bg-card rounded-xl p-6 shadow-sm border flex flex-col">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-medium">{form.title}</h3>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>{form.responses} responses</span>
              <span>Created: {new Date(form.created).toLocaleDateString()}</span>
            </div>
            <div className="flex gap-2 mt-4">
              <button className="flex-1 px-3 py-1.5 text-xs rounded-md bg-secondary hover:bg-secondary/80 transition-colors">
                Edit
              </button>
              <button className="flex-1 px-3 py-1.5 text-xs rounded-md bg-secondary hover:bg-secondary/80 transition-colors">
                View Responses
              </button>
              <button className="flex-1 px-3 py-1.5 text-xs rounded-md bg-secondary hover:bg-secondary/80 transition-colors">
                Share
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
