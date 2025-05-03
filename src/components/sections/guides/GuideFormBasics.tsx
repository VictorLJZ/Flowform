"use client"

import { motion } from "motion/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Settings, Share } from "lucide-react"

export default function GuideFormBasics() {
  return (
    <section id="form-basics" className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              2
            </div>
            <h2 className="text-3xl font-bold text-gray-900 ml-3">Form Basics</h2>
          </div>
          
          <div className="prose prose-lg max-w-none text-gray-600 mb-10">
            <p>
              Creating a form in FlowForm is simple and intuitive. Let's walk through the basic steps to create your first form.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <Card className="p-6 border-primary/20">
              <h3 className="text-xl font-semibold mb-4">Creating a New Form</h3>
              <div className="space-y-4 text-gray-600">
                <div className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium mr-3 mt-0.5 flex-shrink-0">1</div>
                  <div>
                    <p>Navigate to your dashboard and click the "Create New Form" button.</p>
                    <div className="mt-3 flex">
                      <Button className="mr-2">
                        <Plus className="mr-2 h-4 w-4" />
                        Create New Form
                      </Button>
                      <div className="ml-2 text-sm italic mt-2">← Click this button on your dashboard</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium mr-3 mt-0.5 flex-shrink-0">2</div>
                  <div>
                    <p>Choose to start from scratch or select a template. Templates are pre-built forms for common use cases.</p>
                    <div className="mt-3 grid grid-cols-3 gap-3">
                      <div className="border border-gray-200 rounded-md p-3 hover:border-primary cursor-pointer">
                        <div className="h-16 bg-gray-100 rounded mb-2"></div>
                        <div className="text-sm font-medium">Blank Form</div>
                      </div>
                      <div className="border border-gray-200 rounded-md p-3 hover:border-primary cursor-pointer">
                        <div className="h-16 bg-gray-100 rounded mb-2"></div>
                        <div className="text-sm font-medium">Customer Survey</div>
                      </div>
                      <div className="border border-gray-200 rounded-md p-3 hover:border-primary cursor-pointer">
                        <div className="h-16 bg-gray-100 rounded mb-2"></div>
                        <div className="text-sm font-medium">Event RSVP</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium mr-3 mt-0.5 flex-shrink-0">3</div>
                  <div>
                    <p>Enter your form title and description. This helps respondents understand what information you're collecting and why.</p>
                    <div className="mt-3 bg-white border border-gray-200 rounded-lg p-4">
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Form Title</label>
                        <div className="h-10 border border-gray-300 rounded-md px-3 py-2">Customer Feedback Survey</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Form Description</label>
                        <div className="h-20 border border-gray-300 rounded-md px-3 py-2">We value your feedback. Please take a few minutes to share your thoughts on our products and services.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 border-primary/20">
              <h3 className="text-xl font-semibold mb-4">Configuring Form Settings</h3>
              <div className="space-y-4 text-gray-600">
                <div className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium mr-3 mt-0.5 flex-shrink-0">
                    <Settings className="h-3 w-3" />
                  </div>
                  <div>
                    <p>Access form settings to configure various options:</p>
                    <ul className="mt-2 space-y-2">
                      <li className="flex items-center">
                        <div className="h-4 w-4 rounded-full bg-primary/10 mr-2"></div>
                        <span><strong>Design:</strong> Customize colors, fonts, and themes</span>
                      </li>
                      <li className="flex items-center">
                        <div className="h-4 w-4 rounded-full bg-primary/10 mr-2"></div>
                        <span><strong>Privacy:</strong> Control who can view and submit your form</span>
                      </li>
                      <li className="flex items-center">
                        <div className="h-4 w-4 rounded-full bg-primary/10 mr-2"></div>
                        <span><strong>Notifications:</strong> Set up email alerts for new submissions</span>
                      </li>
                      <li className="flex items-center">
                        <div className="h-4 w-4 rounded-full bg-primary/10 mr-2"></div>
                        <span><strong>Integrations:</strong> Connect with other tools in your workflow</span>
                      </li>
                    </ul>
                    <div className="mt-3 bg-gray-100 rounded-lg p-4">
                      <div className="flex items-center">
                        <Settings className="h-4 w-4 mr-2 text-gray-500" />
                        <div className="text-sm font-medium">Form Settings</div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <div className="bg-white rounded-md p-2 border border-gray-200">
                          <div className="text-xs font-medium">Design</div>
                        </div>
                        <div className="bg-white rounded-md p-2 border border-gray-200">
                          <div className="text-xs font-medium">Privacy</div>
                        </div>
                        <div className="bg-white rounded-md p-2 border border-gray-200">
                          <div className="text-xs font-medium">Notifications</div>
                        </div>
                        <div className="bg-white rounded-md p-2 border border-gray-200">
                          <div className="text-xs font-medium">Integrations</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium mr-3 mt-0.5 flex-shrink-0">
                    <Share className="h-3 w-3" />
                  </div>
                  <div>
                    <p>Share your form:</p>
                    <ul className="mt-2 space-y-2">
                      <li className="flex items-center">
                        <div className="h-4 w-4 rounded-full bg-primary/10 mr-2"></div>
                        <span><strong>Direct Link:</strong> Share a URL to your form</span>
                      </li>
                      <li className="flex items-center">
                        <div className="h-4 w-4 rounded-full bg-primary/10 mr-2"></div>
                        <span><strong>Embed:</strong> Add your form to your website</span>
                      </li>
                      <li className="flex items-center">
                        <div className="h-4 w-4 rounded-full bg-primary/10 mr-2"></div>
                        <span><strong>Email:</strong> Send form invitations via email</span>
                      </li>
                      <li className="flex items-center">
                        <div className="h-4 w-4 rounded-full bg-primary/10 mr-2"></div>
                        <span><strong>QR Code:</strong> Generate a QR code for offline access</span>
                      </li>
                    </ul>
                    <div className="mt-4 flex">
                      <Button variant="outline" className="mr-2">
                        <Share className="mr-2 h-4 w-4" />
                        Share Form
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-xl font-semibold mb-4">Form Builder Interface</h3>
            <p className="mb-6 text-gray-600">The FlowForm builder has an intuitive drag-and-drop interface to make form creation easy.</p>
            <div className="bg-gray-100 rounded-lg p-4 border border-gray-200">
              <div className="grid grid-cols-5 gap-4">
                <div className="col-span-1 bg-white p-3 rounded-md border border-gray-200 h-[300px]">
                  <div className="text-sm font-medium mb-3">Question Types</div>
                  <div className="space-y-2">
                    <div className="bg-gray-50 p-2 rounded text-xs">Short Text</div>
                    <div className="bg-gray-50 p-2 rounded text-xs">Long Text</div>
                    <div className="bg-gray-50 p-2 rounded text-xs">Multiple Choice</div>
                    <div className="bg-gray-50 p-2 rounded text-xs">Checkbox</div>
                    <div className="bg-gray-50 p-2 rounded text-xs">Dropdown</div>
                    <div className="bg-gray-50 p-2 rounded text-xs">File Upload</div>
                    <div className="bg-gray-50 p-2 rounded text-xs">Rating</div>
                  </div>
                </div>
                <div className="col-span-4 bg-white p-4 rounded-md border border-gray-200 h-[300px] relative">
                  <div className="text-center font-medium mb-4">Customer Feedback Survey</div>
                  <div className="space-y-6">
                    <div className="border border-gray-200 p-3 rounded-md">
                      <div className="text-sm mb-2">How satisfied are you with our service?</div>
                      <div className="flex justify-between">
                        <div className="flex items-center">
                          <div className="h-4 w-4 rounded-full border border-gray-300 mr-1"></div>
                          <span className="text-xs">Very Satisfied</span>
                        </div>
                        <div className="flex items-center">
                          <div className="h-4 w-4 rounded-full border border-gray-300 mr-1"></div>
                          <span className="text-xs">Satisfied</span>
                        </div>
                        <div className="flex items-center">
                          <div className="h-4 w-4 rounded-full border border-gray-300 mr-1"></div>
                          <span className="text-xs">Neutral</span>
                        </div>
                        <div className="flex items-center">
                          <div className="h-4 w-4 rounded-full border border-gray-300 mr-1"></div>
                          <span className="text-xs">Dissatisfied</span>
                        </div>
                        <div className="flex items-center">
                          <div className="h-4 w-4 rounded-full border border-gray-300 mr-1"></div>
                          <span className="text-xs">Very Dissatisfied</span>
                        </div>
                      </div>
                      <div className="flex justify-between mt-4 text-xs text-gray-500">
                        <div>Required</div>
                        <div>Edit | Duplicate | Delete</div>
                      </div>
                    </div>

                    <div className="border border-gray-200 p-3 rounded-md border-dashed">
                      <div className="text-sm text-gray-400 text-center">
                        Drag and drop questions here
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-4 right-4">
                    <Button size="sm">Preview</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
