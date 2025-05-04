"use client"

import { motion } from "motion/react"
import { Card, CardContent } from "@/components/ui/card"

export default function GuideWelcome() {
  return (
    <section id="welcome" className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              1
            </div>
            <h2 className="text-3xl font-bold text-gray-900 ml-3">Welcome to FlowForm!</h2>
          </div>
          
          <div className="prose prose-lg max-w-none text-gray-600 mb-10">
            <p>
              FlowForm is the modern form and survey platform that empowers teams to collect data, engage users, and gain insights in a collaborative, productive, and organized way.
            </p>
            <p>
              Whether you&apos;re starting a new data collection project or trying to improve your existing feedback processes, FlowForm adapts to any use case. It helps you simplify and standardize your form creation process in an intuitive way. But don&apos;t let its simplicity fool you! FlowForm is user-friendly, yet still able to handle your team&apos;s most robust data collection needs.
            </p>
            <p>
              This is a quick overview of the things you need to know when you&apos;re just getting started with your first project on FlowForm.
            </p>
          </div>
          
          <Card className="mb-10 border-primary/20">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">Section Overview</h3>
              <p className="text-gray-600 mb-4">In this guide you will learn:</p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium mr-3 mt-0.5 flex-shrink-0">✓</div>
                  <span>What is a form and how to create one</span>
                </li>
                <li className="flex items-start">
                  <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium mr-3 mt-0.5 flex-shrink-0">✓</div>
                  <span>Different types of questions you can add</span>
                </li>
                <li className="flex items-start">
                  <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium mr-3 mt-0.5 flex-shrink-0">✓</div>
                  <span>How to use branching logic for dynamic forms</span>
                </li>
                <li className="flex items-start">
                  <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium mr-3 mt-0.5 flex-shrink-0">✓</div>
                  <span>How to collect and analyze responses</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
            <h3 className="text-xl font-semibold mb-4">Let&apos;s go over the basics</h3>
            <p className="text-gray-600 mb-6">
              A FlowForm project has four key components, but unlimited possibilities:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <div className="absolute top-0 right-0 bg-primary/10 text-primary font-medium px-3 py-1 rounded-bl-lg rounded-tr-lg">
                  Form
                </div>
                <div className="h-40 bg-gray-100 rounded-md mb-4 flex items-center justify-center">
                  <div className="w-4/5 bg-white rounded shadow-sm p-3">
                    <div className="h-4 w-3/4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-10 bg-gray-100 rounded mb-2"></div>
                    <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <h4 className="font-semibold mb-2">What is a form?</h4>
                <p className="text-sm text-gray-600">
                  A form is your complete data collection project. It contains all your questions, settings, and receives all your responses. Think of it as your container for everything.
                </p>
              </div>
              
              <div className="relative bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <div className="absolute top-0 right-0 bg-primary/10 text-primary font-medium px-3 py-1 rounded-bl-lg rounded-tr-lg">
                  Questions
                </div>
                <div className="h-40 bg-gray-100 rounded-md mb-4 flex items-center justify-center">
                  <div className="w-4/5 space-y-3">
                    <div className="h-8 bg-white rounded shadow-sm p-2 flex items-center">
                      <div className="h-3 w-3/4 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-8 bg-white rounded shadow-sm p-2 flex items-center">
                      <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-8 bg-white rounded shadow-sm p-2 flex items-center">
                      <div className="h-3 w-2/3 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
                <h4 className="font-semibold mb-2">What are questions?</h4>
                <p className="text-sm text-gray-600">
                  Questions are the individual data collection points in your form. They can be simple text fields, multiple choice, or more complex options like file uploads.
                </p>
              </div>

              <div className="relative bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <div className="absolute top-0 right-0 bg-primary/10 text-primary font-medium px-3 py-1 rounded-bl-lg rounded-tr-lg">
                  Logic
                </div>
                <div className="h-40 bg-gray-100 rounded-md mb-4 flex items-center justify-center">
                  <div className="w-4/5 flex flex-col items-center">
                    <div className="h-8 w-full bg-white rounded shadow-sm mb-2"></div>
                    <div className="flex items-center justify-center">
                      <div className="h-4 w-4 border-l-2 border-t-2 border-primary -rotate-45 mx-2"></div>
                      <div className="h-4 w-4 border-r-2 border-t-2 border-primary rotate-45 mx-2"></div>
                    </div>
                    <div className="flex w-full justify-between mt-2">
                      <div className="h-8 w-2/5 bg-white rounded shadow-sm"></div>
                      <div className="h-8 w-2/5 bg-white rounded shadow-sm"></div>
                    </div>
                  </div>
                </div>
                <h4 className="font-semibold mb-2">What is branching logic?</h4>
                <p className="text-sm text-gray-600">
                  Branching logic determines what questions appear next based on previous answers, creating personalized form experiences for each respondent.
                </p>
              </div>
              
              <div className="relative bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <div className="absolute top-0 right-0 bg-primary/10 text-primary font-medium px-3 py-1 rounded-bl-lg rounded-tr-lg">
                  Responses
                </div>
                <div className="h-40 bg-gray-100 rounded-md mb-4 flex items-center justify-center">
                  <div className="w-4/5">
                    <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                    <div className="h-20 w-full bg-white rounded shadow-sm p-2">
                      <div className="h-2 w-3/4 bg-primary rounded mb-2"></div>
                      <div className="h-2 w-1/2 bg-blue-400 rounded mb-2"></div>
                      <div className="h-2 w-2/3 bg-green-400 rounded"></div>
                    </div>
                  </div>
                </div>
                <h4 className="font-semibold mb-2">What are responses?</h4>
                <p className="text-sm text-gray-600">
                  Responses are the submissions you receive from your form. They&apos;re collected, organized, and can be analyzed within FlowForm&apos;s analytics dashboard.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
