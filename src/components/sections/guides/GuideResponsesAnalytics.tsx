"use client"

import { motion } from "motion/react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, PieChart, DownloadIcon, FilterIcon, MailIcon } from "lucide-react"

export default function GuideResponsesAnalytics() {
  return (
    <section id="responses-analytics" className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              5
            </div>
            <h2 className="text-3xl font-bold text-gray-900 ml-3">Responses & Analytics</h2>
          </div>
          
          <div className="prose prose-lg max-w-none text-gray-600 mb-10">
            <p>
              Once your form is live and collecting responses, FlowForm provides powerful tools to view, analyze, and act on the data you&apos;ve collected.
            </p>
          </div>

          <Tabs defaultValue="responses" className="mb-12">
            <TabsList className="grid grid-cols-1 sm:grid-cols-3 mb-8">
              <TabsTrigger value="responses">Viewing Responses</TabsTrigger>
              <TabsTrigger value="analytics">Analytics Dashboard</TabsTrigger>
              <TabsTrigger value="export">Exporting Data</TabsTrigger>
            </TabsList>
            
            <TabsContent value="responses" className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Viewing Individual Responses</h3>
              <p className="mb-6 text-gray-600">FlowForm makes it easy to view, sort, and manage individual responses from your forms.</p>
              
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="bg-white rounded-lg shadow-sm mb-6">
                  <div className="p-4 border-b">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold">Responses (24)</h4>
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 rounded hover:bg-gray-100 cursor-pointer">
                          <FilterIcon className="h-4 w-4 text-gray-500" />
                        </div>
                        <div className="p-1.5 rounded hover:bg-gray-100 cursor-pointer">
                          <DownloadIcon className="h-4 w-4 text-gray-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="p-3 border-b">Respondent</th>
                          <th className="p-3 border-b">Date</th>
                          <th className="p-3 border-b">Status</th>
                          <th className="p-3 border-b">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-3">john.doe@example.com</td>
                          <td className="p-3">May 2, 2025</td>
                          <td className="p-3"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Complete</span></td>
                          <td className="p-3 text-primary text-xs">View</td>
                        </tr>
                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-3">sarah.smith@example.com</td>
                          <td className="p-3">May 1, 2025</td>
                          <td className="p-3"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Complete</span></td>
                          <td className="p-3 text-primary text-xs">View</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="p-3">mike.jones@example.com</td>
                          <td className="p-3">April 30, 2025</td>
                          <td className="p-3"><span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">Partial</span></td>
                          <td className="p-3 text-primary text-xs">View</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                  <h4 className="font-semibold mb-4">Response Details</h4>
                  <div className="space-y-4">
                    <div className="border-b pb-3">
                      <div className="text-sm text-gray-500 mb-1">Full Name</div>
                      <div>John Doe</div>
                    </div>
                    <div className="border-b pb-3">
                      <div className="text-sm text-gray-500 mb-1">Email Address</div>
                      <div>john.doe@example.com</div>
                    </div>
                    <div className="border-b pb-3">
                      <div className="text-sm text-gray-500 mb-1">How satisfied are you with our service?</div>
                      <div>Very Satisfied</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Additional comments</div>
                      <div className="text-sm">The customer service was excellent. I received prompt assistance with my issue and was very impressed with the knowledge of the support team.</div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="analytics" className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Analytics Dashboard</h3>
              <p className="mb-6 text-gray-600">Gain valuable insights from your form data with FlowForm&apos;s interactive analytics dashboard.</p>
              
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-sm text-gray-500 mb-1">Responses</div>
                    <div className="text-2xl font-bold">247</div>
                    <div className="text-xs text-green-600 mt-1">+12% from last month</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-sm text-gray-500 mb-1">Completion Rate</div>
                    <div className="text-2xl font-bold">89%</div>
                    <div className="text-xs text-green-600 mt-1">+3% from last month</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-sm text-gray-500 mb-1">Avg. Completion Time</div>
                    <div className="text-2xl font-bold">2:34</div>
                    <div className="text-xs text-red-600 mt-1">+0:12 from last month</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold">Response Over Time</h4>
                      <BarChart3 className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="h-48 flex items-end justify-between space-x-2">
                      {[30, 45, 25, 60, 42, 65, 72, 58, 40, 50].map((height, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center">
                          <div className="h-full w-full flex items-end">
                            <div 
                              className="w-full bg-primary/70 rounded-t"
                              style={{ height: `${height}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{i + 1}</div>
                        </div>
                      ))}
                    </div>
                    <div className="text-center text-xs text-gray-500 mt-2">May 2025</div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold">Satisfaction Rating</h4>
                      <PieChart className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="relative h-40 w-40">
                        <div className="absolute inset-0 rounded-full" style={{ 
                          background: "conic-gradient(#22c55e 0% 60%, #3b82f6 60% 75%, #f97316 75% 85%, #ef4444 85% 100%)" 
                        }}></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-white h-28 w-28 rounded-full"></div>
                        </div>
                      </div>
                      <div className="ml-6 space-y-2">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                          <div className="text-sm">Very Satisfied (60%)</div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                          <div className="text-sm">Satisfied (15%)</div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                          <div className="text-sm">Neutral (10%)</div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                          <div className="text-sm">Dissatisfied (15%)</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="export" className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Exporting & Sharing Data</h3>
              <p className="mb-6 text-gray-600">FlowForm makes it easy to export your data in multiple formats for further analysis or reporting.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4 border-primary/20">
                  <h4 className="font-medium mb-2">Export Options</h4>
                  <p className="text-sm text-gray-600 mb-4">Download your response data in multiple formats:</p>
                  <div className="space-y-3">
                    <div className="flex items-center p-3 bg-gray-50 rounded border border-gray-200">
                      <DownloadIcon className="h-5 w-5 text-gray-500 mr-3" />
                      <div>
                        <div className="font-medium text-sm">CSV Export</div>
                        <div className="text-xs text-gray-500">Perfect for spreadsheet analysis</div>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded border border-gray-200">
                      <DownloadIcon className="h-5 w-5 text-gray-500 mr-3" />
                      <div>
                        <div className="font-medium text-sm">PDF Report</div>
                        <div className="text-xs text-gray-500">Great for presentations and sharing</div>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded border border-gray-200">
                      <DownloadIcon className="h-5 w-5 text-gray-500 mr-3" />
                      <div>
                        <div className="font-medium text-sm">Excel Export</div>
                        <div className="text-xs text-gray-500">Complete with data formatting</div>
                      </div>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4 border-primary/20">
                  <h4 className="font-medium mb-2">Automatic Actions</h4>
                  <p className="text-sm text-gray-600 mb-4">Set up automatic actions when new responses are received:</p>
                  <div className="space-y-3">
                    <div className="flex items-center p-3 bg-gray-50 rounded border border-gray-200">
                      <MailIcon className="h-5 w-5 text-gray-500 mr-3" />
                      <div>
                        <div className="font-medium text-sm">Email Notifications</div>
                        <div className="text-xs text-gray-500">Get alerted for new submissions</div>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded border border-gray-200">
                      <svg className="h-5 w-5 text-gray-500 mr-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.4264 8.51369C19.3971 5.21957 16.7063 2.54348 13.4055 2.51367C10.6611 2.52369 8.25908 4.27759 7.45807 6.92545C5.54857 7.00317 3.90252 8.56899 3.83199 10.4815C3.7465 12.7465 5.53934 14.6462 7.77804 14.6462H18.8558C20.6145 14.4722 22 13.0026 22 11.2113C22 9.87761 21.1394 8.7427 19.9427 8.32227" />
                        <path d="M12 14.6465V20.0001M12 20.0001L14.5 17.5001M12 20.0001L9.5 17.5001" />
                      </svg>
                      <div>
                        <div className="font-medium text-sm">Data Integrations</div>
                        <div className="text-xs text-gray-500">Connect with other business tools</div>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded border border-gray-200">
                      <svg className="h-5 w-5 text-gray-500 mr-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16 3H8C6.34315 3 5 4.34315 5 6V18C5 19.6569 6.34315 21 8 21H16C17.6569 21 19 19.6569 19 18V6C19 4.34315 17.6569 3 16 3Z" />
                        <path d="M12 18H12.01M8 9H16M8 13H13" />
                      </svg>
                      <div>
                        <div className="font-medium text-sm">Scheduled Reports</div>
                        <div className="text-xs text-gray-500">Get regular data summaries</div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="bg-primary/5 border border-primary/10 rounded-lg p-6 mt-12">
            <h3 className="text-xl font-semibold mb-4">Next Steps</h3>
            <p className="text-gray-600 mb-6">Now that you understand the basics of FlowForm, you&apos;re ready to create your first form!</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-3">1</div>
                <h4 className="font-medium mb-2">Create a Form</h4>
                <p className="text-sm text-gray-600">Start with a template or build your form from scratch.</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-3">2</div>
                <h4 className="font-medium mb-2">Share Your Form</h4>
                <p className="text-sm text-gray-600">Distribute your form via link, embed, or email.</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-3">3</div>
                <h4 className="font-medium mb-2">Analyze Results</h4>
                <p className="text-sm text-gray-600">Gain insights from your form responses.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
