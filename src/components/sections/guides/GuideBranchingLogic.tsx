"use client"

import { motion } from "motion/react"
import { Card } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

export default function GuideBranchingLogic() {
  return (
    <section id="branching-logic" className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              4
            </div>
            <h2 className="text-3xl font-bold text-gray-900 ml-3">Branching Logic</h2>
          </div>
          
          <div className="prose prose-lg max-w-none text-gray-600 mb-10">
            <p>
              Branching logic allows you to create dynamic forms that adapt based on respondents&apos; answers. This creates a more personalized experience and helps collect only relevant information.
            </p>
          </div>

          <Card className="p-6 border-primary/20 mb-8">
            <h3 className="text-xl font-semibold mb-4">How Branching Logic Works</h3>
            <p className="mb-6 text-gray-600">Branching logic uses &quot;if-then&quot; conditions to determine which questions to show next:</p>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <div className="flex flex-col md:flex-row items-center justify-center">
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-w-xs mb-4 md:mb-0">
                  <div className="text-sm mb-2">Do you own a pet?</div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="h-4 w-4 rounded-full border border-gray-300 mr-2 flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                      </div>
                      <span className="text-sm">Yes</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-4 w-4 rounded-full border border-gray-300 mr-2"></div>
                      <span className="text-sm">No</span>
                    </div>
                  </div>
                </div>
                
                <ArrowRight className="mx-4 text-primary h-8 w-8" />
                
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-w-xs">
                  <div className="text-sm mb-2">What type of pet do you own?</div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="h-4 w-4 rounded-full border border-gray-300 mr-2"></div>
                      <span className="text-sm">Dog</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-4 w-4 rounded-full border border-gray-300 mr-2"></div>
                      <span className="text-sm">Cat</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-4 w-4 rounded-full border border-gray-300 mr-2"></div>
                      <span className="text-sm">Other</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center text-sm text-gray-500 mt-4">
                This question only appears if the respondent answers &quot;Yes&quot; to the previous question.
              </div>
            </div>
            
            <h4 className="font-medium mb-3">Benefits of Branching Logic:</h4>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <div className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0">✓</div>
                <span>Shorter, more relevant forms for respondents</span>
              </li>
              <li className="flex items-start">
                <div className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0">✓</div>
                <span>Higher completion rates due to better user experience</span>
              </li>
              <li className="flex items-start">
                <div className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0">✓</div>
                <span>More accurate and targeted data collection</span>
              </li>
              <li className="flex items-start">
                <div className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0">✓</div>
                <span>Ability to create complex form flows that adapt to different scenarios</span>
              </li>
            </ul>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-6 border-primary/20">
              <h3 className="text-xl font-semibold mb-4">Setting Up Branching Logic</h3>
              <div className="space-y-4 text-gray-600">
                <div className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium mr-3 mt-0.5 flex-shrink-0">1</div>
                  <div>
                    <p>Select a question that will determine which question appears next.</p>
                    <div className="mt-2 bg-gray-50 p-3 rounded border border-gray-200">
                      <div className="text-sm mb-1">Source Question</div>
                      <div className="flex items-center bg-white p-2 rounded border">
                        <span className="text-xs">Do you own a pet?</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium mr-3 mt-0.5 flex-shrink-0">2</div>
                  <div>
                    <p>Define the condition that triggers the branch.</p>
                    <div className="mt-2 bg-gray-50 p-3 rounded border border-gray-200">
                      <div className="text-sm mb-1">Condition</div>
                      <div className="flex items-center bg-white p-2 rounded border">
                        <span className="text-xs">Answer equals &quot;Yes&quot;</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium mr-3 mt-0.5 flex-shrink-0">3</div>
                  <div>
                    <p>Select the question to show when the condition is met.</p>
                    <div className="mt-2 bg-gray-50 p-3 rounded border border-gray-200">
                      <div className="text-sm mb-1">Target Question</div>
                      <div className="flex items-center bg-white p-2 rounded border">
                        <span className="text-xs">What type of pet do you own?</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 border-primary/20">
              <h3 className="text-xl font-semibold mb-4">Advanced Branching Techniques</h3>
              <div className="space-y-4 text-gray-600">
                <div>
                  <h4 className="font-medium mb-2">Multiple Conditions</h4>
                  <p className="text-sm">Combine multiple conditions using AND/OR logic for more complex branching scenarios.</p>
                  <div className="mt-2 bg-gray-50 p-3 rounded border border-gray-200">
                    <div className="text-xs">IF (Pet Type = &quot;Dog&quot; AND Pet Age &gt; 2) THEN show &quot;Dog Training Questions&quot;</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Skip Logic</h4>
                  <p className="text-sm">Skip entire sections based on previous answers to streamline the form experience.</p>
                  <div className="mt-2 bg-gray-50 p-3 rounded border border-gray-200">
                    <div className="text-xs">IF (Has Insurance = &quot;No&quot;) THEN skip &quot;Insurance Details Section&quot;</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Page Branching</h4>
                  <p className="text-sm">Direct respondents to different pages based on their responses.</p>
                  <div className="mt-2 bg-gray-50 p-3 rounded border border-gray-200">
                    <div className="text-xs">IF (Customer Type = &quot;Business&quot;) THEN go to &quot;Business Questions Page&quot;</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
