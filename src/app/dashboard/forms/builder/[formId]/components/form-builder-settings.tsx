"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClockIcon, PaletteIcon, Settings2, Share2Icon } from "lucide-react"

export default function FormBuilderSettings() {
  const [selectedTab, setSelectedTab] = useState("general")
  
  return (
    <div className="w-80 border-l flex flex-col h-full bg-background">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-medium">Form Settings</h3>
        <Button variant="outline" size="sm">
          Save
        </Button>
      </div>
      
      <Tabs defaultValue="general" className="flex-1 flex flex-col" onValueChange={setSelectedTab}>
        <div className="px-1 pt-1 border-b">
          <TabsList className="w-full justify-start bg-transparent p-0">
            <TabsTrigger 
              value="general" 
              className="data-[state=active]:bg-background data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:rounded-none px-4 py-2 h-10"
            >
              General
            </TabsTrigger>
            <TabsTrigger 
              value="design" 
              className="data-[state=active]:bg-background data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:rounded-none px-4 py-2 h-10"
            >
              Design
            </TabsTrigger>
            <TabsTrigger 
              value="sharing" 
              className="data-[state=active]:bg-background data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:rounded-none px-4 py-2 h-10"
            >
              Sharing
            </TabsTrigger>
          </TabsList>
        </div>
        
        <ScrollArea className="flex-1">
          <TabsContent value="general" className="m-0 p-4 space-y-6">
            <div className="space-y-1.5">
              <Label htmlFor="form-title">Form Title</Label>
              <Input 
                id="form-title" 
                placeholder="Enter form title" 
                defaultValue="Untitled Form" 
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="form-description">Description (optional)</Label>
              <Input 
                id="form-description" 
                placeholder="Enter form description" 
              />
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center">
                <Settings2 size={16} className="mr-2" />
                Settings
              </h4>
              
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-progress-bar">Progress Bar</Label>
                    <div className="text-xs text-muted-foreground">
                      Show progress bar to respondents
                    </div>
                  </div>
                  <Switch id="show-progress-bar" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="require-sign-in">Require Sign In</Label>
                    <div className="text-xs text-muted-foreground">
                      Respondents must be logged in
                    </div>
                  </div>
                  <Switch id="require-sign-in" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="one-response-per-user">One Response Per User</Label>
                    <div className="text-xs text-muted-foreground">
                      Limit to one response per person
                    </div>
                  </div>
                  <Switch id="one-response-per-user" defaultChecked />
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center">
                <ClockIcon size={16} className="mr-2" />
                Timing
              </h4>
              
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="estimated-time">Estimated Completion Time</Label>
                  <div className="flex space-x-2">
                    <Input id="estimated-time" type="number" defaultValue="5" />
                    <Select defaultValue="minutes">
                      <SelectTrigger className="w-24">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minutes">Minutes</SelectItem>
                        <SelectItem value="hours">Hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-time-estimate">Show Time Estimate</Label>
                    <Switch id="show-time-estimate" defaultChecked />
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Form Status</Label>
                <RadioGroup defaultValue="draft">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="draft" id="status-draft" />
                    <Label htmlFor="status-draft" className="cursor-pointer">Draft</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="published" id="status-published" />
                    <Label htmlFor="status-published" className="cursor-pointer">Published</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="closed" id="status-closed" />
                    <Label htmlFor="status-closed" className="cursor-pointer">Closed</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="design" className="m-0 p-4 space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center">
                <PaletteIcon size={16} className="mr-2" />
                Appearance
              </h4>
              
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Theme</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Card className="p-2 border-2 cursor-pointer border-primary">
                      <div className="h-12 bg-background rounded-sm border mb-1.5"></div>
                      <div className="text-xs text-center">Default</div>
                    </Card>
                    
                    <Card className="p-2 border-2 cursor-pointer">
                      <div className="h-12 bg-slate-800 rounded-sm mb-1.5"></div>
                      <div className="text-xs text-center">Dark</div>
                    </Card>
                    
                    <Card className="p-2 border-2 cursor-pointer">
                      <div className="h-12 bg-purple-50 rounded-sm border mb-1.5"></div>
                      <div className="text-xs text-center">Purple</div>
                    </Card>
                    
                    <Card className="p-2 border-2 cursor-pointer">
                      <div className="h-12 bg-blue-50 rounded-sm border mb-1.5"></div>
                      <div className="text-xs text-center">Blue</div>
                    </Card>
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex space-x-2">
                    <div className="w-10 h-10 rounded-md bg-primary border"></div>
                    <Input id="primary-color" type="text" defaultValue="#0284c7" />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="font-family">Font</Label>
                  <Select defaultValue="inter">
                    <SelectTrigger>
                      <SelectValue placeholder="Select font family" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inter">Inter</SelectItem>
                      <SelectItem value="helvetica">Helvetica</SelectItem>
                      <SelectItem value="georgia">Georgia</SelectItem>
                      <SelectItem value="roboto">Roboto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="sharing" className="m-0 p-4 space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center">
                <Share2Icon size={16} className="mr-2" />
                Sharing Options
              </h4>
              
              <div className="space-y-1.5">
                <Label htmlFor="form-link">Form Link</Label>
                <div className="flex space-x-2">
                  <Input 
                    id="form-link" 
                    value="https://flowform.io/f/abcd1234" 
                    readOnly
                  />
                  <Button variant="outline" size="sm" className="shrink-0">
                    Copy
                  </Button>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="form-visibility">Visibility</Label>
                <RadioGroup defaultValue="public">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="public" id="visibility-public" />
                    <Label htmlFor="visibility-public" className="cursor-pointer">Public</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="private" id="visibility-private" />
                    <Label htmlFor="visibility-private" className="cursor-pointer">Private</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="embed-code">Embed Code</Label>
                <div className="flex flex-col space-y-2">
                  <div className="bg-muted text-xs p-3 rounded-md overflow-x-auto">
                    <code>{`<iframe src="https://flowform.io/embed/abcd1234" width="100%" height="600" frameBorder="0"></iframe>`}</code>
                  </div>
                  <Button variant="outline" size="sm" className="self-start">
                    Copy Embed Code
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  )
}
