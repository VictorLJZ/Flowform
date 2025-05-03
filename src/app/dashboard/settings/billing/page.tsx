"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, CreditCard, FileText, RefreshCw, Shield } from "lucide-react"

export default function BillingSettings() {
  const [activeTab, setActiveTab] = useState("subscription")

  // Mock data for the current user's subscription
  const subscription = {
    plan: "Pro",
    status: "active",
    renewalDate: "June 3, 2025",
    billingCycle: "monthly",
    amount: "$12",
    features: [
      "Unlimited forms",
      "Advanced form logic",
      "Custom domains",
      "Remove FlowForm branding",
      "Priority support",
      "Team collaboration"
    ]
  }

  // Mock data for billing history
  const billingHistory = [
    { 
      id: "INV-001",
      date: "May 3, 2025",
      amount: "$12.00",
      status: "paid"
    },
    { 
      id: "INV-002",
      date: "April 3, 2025",
      amount: "$12.00",
      status: "paid"
    },
    { 
      id: "INV-003",
      date: "March 3, 2025",
      amount: "$12.00",
      status: "paid"
    },
  ]

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Billing & Subscription</h1>
        <Button variant="outline">Contact Support</Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid grid-cols-2 w-[400px]">
          <TabsTrigger value="subscription">
            <Shield className="mr-2 h-4 w-4" />
            Subscription
          </TabsTrigger>
          <TabsTrigger value="billing-history">
            <FileText className="mr-2 h-4 w-4" />
            Billing History
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="subscription" className="space-y-8">
          <div className="flex space-x-6">
            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="flex justify-between">
                  <span>Current Plan</span>
                  <Badge>{subscription.plan}</Badge>
                </CardTitle>
                <CardDescription>Your current plan and billing details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <span className="text-sm font-medium">{subscription.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Next billing date</span>
                    <span className="text-sm font-medium">{subscription.renewalDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Billing cycle</span>
                    <span className="text-sm font-medium capitalize">{subscription.billingCycle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Amount</span>
                    <span className="text-sm font-medium">{subscription.amount}/{subscription.billingCycle === "monthly" ? "mo" : "yr"}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button variant="outline" className="flex-1">Change Plan</Button>
                <Button variant="outline" className="flex-1">Cancel Plan</Button>
              </CardFooter>
            </Card>
            
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Manage your payment details</CardDescription>
              </CardHeader>
              <CardContent className="py-6">
                <div className="flex items-center gap-4">
                  <div className="bg-muted p-2 rounded-md">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-medium">Visa ending in 4242</p>
                    <p className="text-sm text-muted-foreground">Expires 06/2026</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Update Payment Method</Button>
              </CardFooter>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Plan Features</CardTitle>
              <CardDescription>Features included in your current plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {subscription.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="billing-history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>View and download your past invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {billingHistory.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div className="flex items-center gap-4">
                      <div className="bg-muted p-2 rounded-md">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{invoice.id}</p>
                        <p className="text-sm text-muted-foreground">{invoice.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span>{invoice.amount}</span>
                      <Badge variant="outline" className="capitalize">{invoice.status}</Badge>
                      <Button variant="ghost" size="sm">Download</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
