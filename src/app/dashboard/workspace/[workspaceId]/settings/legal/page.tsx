"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, FileText, History } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

// Sample legal documents
const legalDocuments = [
  {
    id: "terms",
    title: "Terms of Service",
    lastUpdated: "April 15, 2025",
    versions: [
      { version: "2.0", date: "April 15, 2025" },
      { version: "1.5", date: "January 10, 2025" },
      { version: "1.0", date: "June 22, 2024" },
    ]
  },
  {
    id: "privacy",
    title: "Privacy Policy",
    lastUpdated: "April 15, 2025",
    versions: [
      { version: "2.0", date: "April 15, 2025" },
      { version: "1.0", date: "June 22, 2024" },
    ]
  },
  {
    id: "dpa",
    title: "Data Processing Agreement",
    lastUpdated: "March 5, 2025",
    versions: [
      { version: "1.1", date: "March 5, 2025" },
      { version: "1.0", date: "June 22, 2024" },
    ]
  },
  {
    id: "sla",
    title: "Service Level Agreement",
    lastUpdated: "February 8, 2025",
    versions: [
      { version: "1.2", date: "February 8, 2025" },
      { version: "1.1", date: "November 12, 2024" },
      { version: "1.0", date: "June 22, 2024" },
    ]
  },
]

export default function LegalDocumentsSettings() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Legal Documents</h1>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Active Legal Agreements</CardTitle>
          <CardDescription>
            Current legal documents applicable to your FlowForm account and organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {legalDocuments.map((doc) => (
              <div key={doc.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <FileText className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <h3 className="font-medium">{doc.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Last updated: {doc.lastUpdated}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="pl-9">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="versions">
                      <AccordionTrigger className="text-sm flex items-center py-2">
                        <History className="h-4 w-4 mr-2" />
                        Version History
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pl-6 pt-2">
                          {doc.versions.map((ver, i) => (
                            <div key={i} className="flex items-center justify-between">
                              <div className="text-sm">
                                <span className="font-medium">v{ver.version}</span>
                                <span className="text-muted-foreground ml-2">{ver.date}</span>
                              </div>
                              <Button variant="ghost" size="sm" className="h-7">
                                View
                              </Button>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  
                  <div className="flex space-x-3 mt-3">
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <ArrowUpRight className="h-3 w-3" />
                      View Current
                    </Button>
                    <Button variant="outline" size="sm">
                      Download PDF
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Document Acceptance</CardTitle>
          <CardDescription>
            Records of accepted terms and agreements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-2">Your Acceptance Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <div>
                    <p className="font-medium">Terms of Service v2.0</p>
                    <p className="text-sm text-muted-foreground">
                      Accepted on May 1, 2025
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <div>
                    <p className="font-medium">Privacy Policy v2.0</p>
                    <p className="text-sm text-muted-foreground">
                      Accepted on May 1, 2025
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <div>
                    <p className="font-medium">Data Processing Agreement v1.1</p>
                    <p className="text-sm text-muted-foreground">
                      Accepted on March 10, 2025
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
                <div className="flex justify-between py-2">
                  <div>
                    <p className="font-medium">Service Level Agreement v1.2</p>
                    <p className="text-sm text-muted-foreground">
                      Accepted on February 15, 2025
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-3">Organization Acceptance</h3>
              <p className="text-sm text-muted-foreground mb-4">
                These agreements have been accepted on behalf of your organization:
              </p>
              
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <div>
                    <p className="font-medium">Enterprise Terms of Service</p>
                    <p className="text-sm text-muted-foreground">
                      Accepted by admin@flowform.com on May 1, 2025
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
                <div className="flex justify-between py-2">
                  <div>
                    <p className="font-medium">Custom Data Processing Addendum</p>
                    <p className="text-sm text-muted-foreground">
                      Accepted by admin@flowform.com on May 1, 2025
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6 flex justify-end">
          <Button variant="outline">
            Download Acceptance Records
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
