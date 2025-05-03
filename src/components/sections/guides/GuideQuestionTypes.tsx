"use client"

import { motion } from "motion/react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function GuideQuestionTypes() {
  return (
    <section id="question-types" className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              3
            </div>
            <h2 className="text-3xl font-bold text-gray-900 ml-3">Question Types</h2>
          </div>
          
          <div className="prose prose-lg max-w-none text-gray-600 mb-10">
            <p>
              FlowForm offers a variety of question types to collect different kinds of data. Understanding each type will help you build more effective forms.
            </p>
          </div>

          <Tabs defaultValue="text" className="mb-12">
            <TabsList className="grid grid-cols-3 lg:grid-cols-6 mb-8">
              <TabsTrigger value="text">Text</TabsTrigger>
              <TabsTrigger value="choice">Multiple Choice</TabsTrigger>
              <TabsTrigger value="numeric">Numeric</TabsTrigger>
              <TabsTrigger value="date">Date & Time</TabsTrigger>
              <TabsTrigger value="file">File Upload</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>
            
            <TabsContent value="text" className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Text Questions</h3>
              <p className="mb-6 text-gray-600">Text questions allow respondents to enter text-based answers. FlowForm offers multiple text input options:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4 border-primary/20">
                  <h4 className="font-medium mb-2">Short Text</h4>
                  <p className="text-sm text-gray-600 mb-4">Best for collecting brief responses like names, email addresses, or short answers.</p>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="text-sm mb-2">What is your full name?</div>
                    <div className="h-10 border border-gray-300 rounded-md"></div>
                  </div>
                </Card>
                
                <Card className="p-4 border-primary/20">
                  <h4 className="font-medium mb-2">Paragraph Text</h4>
                  <p className="text-sm text-gray-600 mb-4">Ideal for collecting longer responses like feedback, comments, or detailed explanations.</p>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="text-sm mb-2">Please share your feedback about our service:</div>
                    <div className="h-24 border border-gray-300 rounded-md"></div>
                  </div>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="choice" className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Multiple Choice Questions</h3>
              <p className="mb-6 text-gray-600">Choice questions allow respondents to select from predefined options:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4 border-primary/20">
                  <h4 className="font-medium mb-2">Radio Buttons</h4>
                  <p className="text-sm text-gray-600 mb-4">For selecting a single option from a list of choices.</p>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="text-sm mb-2">Which category best describes you?</div>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <div className="h-4 w-4 rounded-full border border-gray-300 mr-2"></div>
                        <span className="text-sm">Student</span>
                      </div>
                      <div className="flex items-center">
                        <div className="h-4 w-4 rounded-full border border-gray-300 mr-2 flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-primary"></div>
                        </div>
                        <span className="text-sm">Professional</span>
                      </div>
                      <div className="flex items-center">
                        <div className="h-4 w-4 rounded-full border border-gray-300 mr-2"></div>
                        <span className="text-sm">Retired</span>
                      </div>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4 border-primary/20">
                  <h4 className="font-medium mb-2">Checkboxes</h4>
                  <p className="text-sm text-gray-600 mb-4">For selecting multiple options from a list of choices.</p>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="text-sm mb-2">Select all products you're interested in:</div>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <div className="h-4 w-4 rounded border border-gray-300 mr-2 flex items-center justify-center">
                          <div className="h-2 w-2 rounded bg-primary"></div>
                        </div>
                        <span className="text-sm">Product A</span>
                      </div>
                      <div className="flex items-center">
                        <div className="h-4 w-4 rounded border border-gray-300 mr-2"></div>
                        <span className="text-sm">Product B</span>
                      </div>
                      <div className="flex items-center">
                        <div className="h-4 w-4 rounded border border-gray-300 mr-2 flex items-center justify-center">
                          <div className="h-2 w-2 rounded bg-primary"></div>
                        </div>
                        <span className="text-sm">Product C</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </section>
  )
}
