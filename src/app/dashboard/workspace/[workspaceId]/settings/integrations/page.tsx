"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"

const integrations = [
  {
    id: "openai",
    name: "OpenAI",
    description: "Connect to OpenAI for AI-powered form responses",
    icon: "🤖",
    connected: true,
    category: "ai"
  },
  {
    id: "google",
    name: "Google Sheets",
    description: "Export form submissions to Google Sheets",
    icon: "📊",
    connected: false,
    category: "export"
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Connect FlowForm to thousands of apps",
    icon: "⚡",
    connected: false,
    category: "automation"
  },
  {
    id: "slack",
    name: "Slack",
    description: "Get notified about new form submissions",
    icon: "💬",
    connected: false,
    category: "notification"
  },
  {
    id: "notion",
    name: "Notion",
    description: "Save form data directly to Notion databases",
    icon: "📓",
    connected: false,
    category: "export"
  },
]

export default function IntegrationsSettings() {
  const [filter, setFilter] = useState<string>("all")
  const [installedOnly, setInstalledOnly] = useState(false)
  
  const filteredIntegrations = integrations.filter(integration => {
    if (installedOnly && !integration.connected) {
      return false
    }
    
    if (filter !== "all" && integration.category !== filter) {
      return false
    }
    
    return true
  })
  
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Integrations</h1>
      </div>
      
      <div className="flex flex-col space-y-8">
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            <Button 
              variant={filter === "all" ? "default" : "outline"} 
              size="sm"
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button 
              variant={filter === "ai" ? "default" : "outline"} 
              size="sm"
              onClick={() => setFilter("ai")}
            >
              AI Services
            </Button>
            <Button 
              variant={filter === "export" ? "default" : "outline"} 
              size="sm"
              onClick={() => setFilter("export")}
            >
              Data Export
            </Button>
            <Button 
              variant={filter === "notification" ? "default" : "outline"} 
              size="sm"
              onClick={() => setFilter("notification")}
            >
              Notifications
            </Button>
            <Button 
              variant={filter === "automation" ? "default" : "outline"} 
              size="sm"
              onClick={() => setFilter("automation")}
            >
              Automation
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="installed-only" 
              checked={installedOnly}
              onCheckedChange={setInstalledOnly}
            />
            <Label htmlFor="installed-only">Installed only</Label>
          </div>
        </div>
        
        <Separator />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredIntegrations.map((integration) => (
            <Card key={integration.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-md bg-muted">
                    <span className="text-2xl">{integration.icon}</span>
                  </div>
                  <div>
                    <CardTitle className="text-xl">{integration.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {integration.description}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={integration.connected ? "default" : "outline"}>
                  {integration.connected ? "Connected" : "Not Connected"}
                </Badge>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">
                  {integration.connected ? (
                    <p>Connected on May 3, 2025</p>
                  ) : (
                    <p>Connect to enable this integration</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant={integration.connected ? "outline" : "default"} className="w-full">
                  {integration.connected ? "Manage" : "Connect"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
