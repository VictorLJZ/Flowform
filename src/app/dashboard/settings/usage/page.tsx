"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { useState } from "react"
import { BarChart, Calendar, CircleHelp, FileArchive, FileQuestion, FileType, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function UsageSettings() {
  const [period, setPeriod] = useState("month")
  const [activeTab, setActiveTab] = useState("forms")
  
  // Mock usage data
  const usageData = {
    forms: {
      total: 25,
      limit: 100,
      percentage: 25,
    },
    submissions: {
      total: 1250,
      limit: 5000,
      percentage: 25,
    },
    storage: {
      used: "215 MB",
      total: "5 GB",
      percentage: 4,
    },
    users: {
      active: 8,
      limit: 10,
      percentage: 80,
    },
    aiResponses: {
      used: 328,
      limit: 1000,
      percentage: 32.8,
    }
  }
  
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Usage & Limits</h1>
        <div className="flex gap-2 items-center">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Past 7 days</SelectItem>
              <SelectItem value="month">Past 30 days</SelectItem>
              <SelectItem value="quarter">Past 90 days</SelectItem>
              <SelectItem value="year">Past 12 months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">Export Report</Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">
              Form Count
            </CardTitle>
            <FileType className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageData.forms.total}</div>
            <Progress value={usageData.forms.percentage} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {usageData.forms.percentage}% of your limit ({usageData.forms.limit})
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">
              Form Submissions
            </CardTitle>
            <FileArchive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageData.submissions.total}</div>
            <Progress value={usageData.submissions.percentage} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {usageData.submissions.percentage}% of your limit ({usageData.submissions.limit})
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">
              Team Members
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageData.users.active}</div>
            <Progress value={usageData.users.percentage} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {usageData.users.percentage}% of your limit ({usageData.users.limit})
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid grid-cols-4 w-[500px]">
          <TabsTrigger value="forms">
            <FileType className="mr-2 h-4 w-4" />
            Forms
          </TabsTrigger>
          <TabsTrigger value="submissions">
            <FileArchive className="mr-2 h-4 w-4" />
            Submissions
          </TabsTrigger>
          <TabsTrigger value="ai">
            <FileQuestion className="mr-2 h-4 w-4" />
            AI Usage
          </TabsTrigger>
          <TabsTrigger value="storage">
            <Calendar className="mr-2 h-4 w-4" />
            Storage
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="forms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Form Usage</CardTitle>
              <CardDescription>Track your form creation usage over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="flex flex-col items-center gap-2 text-center">
                <BarChart className="h-16 w-16 text-muted-foreground/50" />
                <div>
                  <p className="text-sm font-medium">Form Usage Chart</p>
                  <p className="text-sm text-muted-foreground">Shows your form creation over time</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Usage Breakdown</CardTitle>
                <CardDescription>Form usage by type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Basic Forms</span>
                      <span className="text-sm font-medium">12</span>
                    </div>
                    <Progress value={48} className="h-1" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Conditional Logic Forms</span>
                      <span className="text-sm font-medium">8</span>
                    </div>
                    <Progress value={32} className="h-1" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">AI-powered Forms</span>
                      <span className="text-sm font-medium">5</span>
                    </div>
                    <Progress value={20} className="h-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Form Limits</CardTitle>
                <CardDescription>Your plan's form limits and usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">
                        Total Forms
                        <CircleHelp className="h-3 w-3 text-muted-foreground inline ml-1" />
                      </span>
                      <span className="text-sm font-medium">{usageData.forms.total} / {usageData.forms.limit}</span>
                    </div>
                    <Progress value={usageData.forms.percentage} className="h-1" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">
                        Published Forms
                        <CircleHelp className="h-3 w-3 text-muted-foreground inline ml-1" />
                      </span>
                      <span className="text-sm font-medium">18 / 50</span>
                    </div>
                    <Progress value={36} className="h-1" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">
                        Archived Forms
                        <CircleHelp className="h-3 w-3 text-muted-foreground inline ml-1" />
                      </span>
                      <span className="text-sm font-medium">7 / 100</span>
                    </div>
                    <Progress value={7} className="h-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="submissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Submission Usage</CardTitle>
              <CardDescription>Track your form submission usage over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="flex flex-col items-center gap-2 text-center">
                <BarChart className="h-16 w-16 text-muted-foreground/50" />
                <div>
                  <p className="text-sm font-medium">Submission Chart</p>
                  <p className="text-sm text-muted-foreground">Shows your form submissions over time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Response Usage</CardTitle>
              <CardDescription>Track your AI response usage over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">AI Responses Used</span>
                    <span className="text-sm font-medium">{usageData.aiResponses.used} / {usageData.aiResponses.limit}</span>
                  </div>
                  <Progress value={usageData.aiResponses.percentage} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {usageData.aiResponses.percentage}% of your monthly allowance
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="storage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Storage Usage</CardTitle>
              <CardDescription>Track your storage usage over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Storage Used</span>
                    <span className="text-sm font-medium">{usageData.storage.used} / {usageData.storage.total}</span>
                  </div>
                  <Progress value={usageData.storage.percentage} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {usageData.storage.percentage}% of your storage allowance
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
