import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { BarChart3, FileText, PlusCircle, Users } from "lucide-react"

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Overview</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Form
            </button>
          </div>
          
          <div className="grid auto-rows-min gap-6 md:grid-cols-3">
            <div className="bg-card rounded-xl p-6 shadow-sm border flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Forms</p>
                <h3 className="text-3xl font-bold mt-1">12</h3>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </div>
            
            <div className="bg-card rounded-xl p-6 shadow-sm border flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Responses</p>
                <h3 className="text-3xl font-bold mt-1">248</h3>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
            </div>
            
            <div className="bg-card rounded-xl p-6 shadow-sm border flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Active Users</p>
                <h3 className="text-3xl font-bold mt-1">5</h3>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>
          
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3 md:grid-rows-2">
            <div className="bg-card rounded-xl p-6 shadow-sm border md:col-span-2 md:row-span-2">
              <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {[
                  { id: 1, form: "Customer Feedback", responses: 42, date: "2 hours ago" },
                  { id: 2, form: "Event Registration", responses: 18, date: "Yesterday" },
                  { id: 3, form: "Product Survey", responses: 56, date: "2 days ago" },
                  { id: 4, form: "Job Application", responses: 12, date: "4 days ago" },
                  { id: 5, form: "Newsletter Signup", responses: 120, date: "1 week ago" },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="bg-secondary p-2 rounded">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{item.form}</p>
                        <p className="text-sm text-muted-foreground">{item.date}</p>
                      </div>
                    </div>
                    <div className="text-sm rounded-full bg-secondary px-2 py-1">
                      {item.responses} responses
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-card rounded-xl p-6 shadow-sm border">
              <h2 className="text-lg font-semibold mb-4">Recent Forms</h2>
              <div className="space-y-3">
                {[
                  { id: 1, name: "Customer Feedback", type: "Survey" },
                  { id: 2, name: "Event Registration", type: "Registration" },
                  { id: 3, name: "Product Survey", type: "Survey" },
                ].map((form) => (
                  <div key={form.id} className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>{form.name}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-card rounded-xl p-6 shadow-sm border">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full text-left flex items-center gap-2 p-2 hover:bg-secondary rounded-md transition-colors">
                  <PlusCircle className="h-4 w-4" /> New Form
                </button>
                <button className="w-full text-left flex items-center gap-2 p-2 hover:bg-secondary rounded-md transition-colors">
                  <FileText className="h-4 w-4" /> View Responses
                </button>
                <button className="w-full text-left flex items-center gap-2 p-2 hover:bg-secondary rounded-md transition-colors">
                  <Users className="h-4 w-4" /> Team Sharing
                </button>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
