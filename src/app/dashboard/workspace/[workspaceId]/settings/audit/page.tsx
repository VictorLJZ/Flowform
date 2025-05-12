"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DownloadCloud, FileText, Filter, RefreshCw, User } from "lucide-react"
import { Input } from "@/components/ui/input"

// Sample audit log entries
const auditLogs = [
  {
    id: "log-1",
    action: "user.login",
    actor: "john.doe@example.com",
    timestamp: "2025-05-03T15:30:45Z",
    ipAddress: "192.168.1.1",
    details: "User logged in successfully",
    severity: "info"
  },
  {
    id: "log-2",
    action: "workspace.member.add",
    actor: "admin@flowform.com",
    timestamp: "2025-05-03T14:22:12Z",
    ipAddress: "192.168.1.2",
    details: "Added user sarah@example.com to workspace",
    severity: "info"
  },
  {
    id: "log-3",
    action: "form.publish",
    actor: "john.doe@example.com",
    timestamp: "2025-05-03T13:15:32Z",
    ipAddress: "192.168.1.1",
    details: "Published form 'Customer Feedback'",
    severity: "info"
  },
  {
    id: "log-4",
    action: "workspace.settings.update",
    actor: "admin@flowform.com",
    timestamp: "2025-05-03T12:05:18Z",
    ipAddress: "192.168.1.2",
    details: "Updated workspace settings",
    severity: "info"
  },
  {
    id: "log-5",
    action: "api.key.create",
    actor: "admin@flowform.com",
    timestamp: "2025-05-02T16:44:21Z",
    ipAddress: "192.168.1.2",
    details: "Created new API key",
    severity: "warning"
  },
]

export default function AuditLogsSettings() {
  // Format the timestamp for display
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  }
  
  // Get badge variant based on severity
  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case "error": return "destructive";
      case "warning": return "secondary";
      default: return "secondary";
    }
  }
  
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Audit Logs</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <DownloadCloud className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Audit Log Filters</CardTitle>
          <CardDescription>
            Filter audit logs by user, action type, or date range
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">User</label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="john">john.doe@example.com</SelectItem>
                  <SelectItem value="admin">admin@flowform.com</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Action Type</label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="user">User Actions</SelectItem>
                  <SelectItem value="workspace">Workspace Changes</SelectItem>
                  <SelectItem value="form">Form Operations</SelectItem>
                  <SelectItem value="api">API Operations</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Period</label>
              <Select defaultValue="7d">
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-4">
            <Input 
              placeholder="Search logs..." 
              className="max-w-sm"
            />
            <Button variant="secondary" size="sm" className="flex items-center gap-1">
              <Filter className="h-4 w-4" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Audit Log Entries</CardTitle>
          <CardDescription>
            Review actions taken within your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {auditLogs.map((log) => (
              <div key={log.id} className="flex items-start py-4 border-b last:border-0">
                <div className="mr-4 mt-1">
                  {log.action.startsWith("user") ? (
                    <User className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{log.action}</p>
                      <p className="text-sm text-muted-foreground">
                        By {log.actor} • {formatTimestamp(log.timestamp)}
                      </p>
                    </div>
                    <Badge variant={getSeverityVariant(log.severity)}>
                      {log.severity}
                    </Badge>
                  </div>
                  <p className="text-sm">{log.details}</p>
                  <p className="text-xs text-muted-foreground">IP: {log.ipAddress}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between items-center mt-6">
            <p className="text-sm text-muted-foreground">
              Showing 5 of 42 log entries
            </p>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
