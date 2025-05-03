"use client"

import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const integrationCategories = [
  {
    name: "CRM & Marketing",
    items: [
      { name: "Salesforce", color: "#00A1E0" },
      { name: "HubSpot", color: "#FF7A59" },
      { name: "Mailchimp", color: "#FFE01B" },
      { name: "ActiveCampaign", color: "#356AE6" },
      { name: "Marketo", color: "#5C4C9F" },
      { name: "Zoho CRM", color: "#E42527" }
    ]
  },
  {
    name: "Communication",
    items: [
      { name: "Slack", color: "#4A154B" },
      { name: "Microsoft Teams", color: "#6264A7" },
      { name: "Gmail", color: "#EA4335" },
      { name: "Outlook", color: "#0078D4" },
      { name: "Discord", color: "#5865F2" },
      { name: "WhatsApp", color: "#25D366" }
    ]
  },
  {
    name: "Project Management",
    items: [
      { name: "Trello", color: "#0079BF" },
      { name: "Asana", color: "#F06A6A" },
      { name: "Monday", color: "#FF3D57" },
      { name: "ClickUp", color: "#7B68EE" },
      { name: "Jira", color: "#0052CC" },
      { name: "Notion", color: "#000000" }
    ]
  },
  {
    name: "Automation",
    items: [
      { name: "Zapier", color: "#FF4A00" },
      { name: "IFTTT", color: "#33CCFF" },
      { name: "Make", color: "#2E2E5B" },
      { name: "Power Automate", color: "#0066FF" },
      { name: "Workato", color: "#3853A4" },
      { name: "Tray.io", color: "#25C9D0" }
    ]
  }
]

export default function IntegrationsApps() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Connect with your favorite apps
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            FlowForm integrates with 100+ popular tools to streamline your workflows and keep your data in sync
          </p>
        </div>

        <Tabs defaultValue="CRM & Marketing" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid grid-cols-4 w-full max-w-3xl">
              {integrationCategories.map((category) => (
                <TabsTrigger key={category.name} value={category.name}>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          {integrationCategories.map((category) => (
            <TabsContent key={category.name} value={category.name}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
                {category.items.map((app) => (
                  <motion.div
                    key={app.name}
                    className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center justify-center hover:shadow-md transition-shadow"
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div 
                      className="h-16 w-16 rounded-xl flex items-center justify-center text-white font-bold text-xl mb-4"
                      style={{ backgroundColor: app.color }}
                    >
                      {app.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-gray-700 text-center">{app.name}</span>
                  </motion.div>
                ))}
              </div>
              <div className="mt-12 text-center">
                <Button size="lg">
                  View all {category.name} integrations
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}
