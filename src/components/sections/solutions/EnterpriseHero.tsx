"use client"

import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { Building } from "lucide-react"

export default function EnterpriseHero() {
  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-slate-50 text-slate-600 rounded-full inline-flex items-center px-3 py-1 text-sm font-medium mb-6">
                <Building className="w-4 h-4 mr-2" />
                <span>Enterprise Solutions</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-6">
                Secure, scalable forms
                <span className="text-slate-600"> for large organizations</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Enterprise-grade form solutions with enhanced security, compliance features, and dedicated support for organizations with complex needs.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button size="lg" className="bg-slate-800 hover:bg-slate-900">
                  Contact sales
                </Button>
                <Button size="lg" variant="outline">
                  Schedule a demo
                </Button>
              </div>
            </motion.div>
          </div>
          <div className="lg:col-span-6 mt-12 lg:mt-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-gradient-to-r from-slate-100 to-slate-50 rounded-2xl p-1">
                <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                  <div className="p-6 bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      <div className="ml-4 text-sm text-gray-500">Enterprise Portal</div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="mb-6">
                      <div className="text-sm font-medium text-gray-700 mb-3">Security & Compliance</div>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <div className="flex items-center mb-2">
                            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center mr-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-700" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="text-sm font-medium">GDPR Compliant</div>
                          </div>
                          <div className="text-xs text-gray-500">
                            Full compliance with European data protection regulations
                          </div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <div className="flex items-center mb-2">
                            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center mr-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-700" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="text-sm font-medium">SOC 2 Type II</div>
                          </div>
                          <div className="text-xs text-gray-500">
                            Certified security controls and processes
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <div className="flex items-center mb-2">
                            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center mr-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-700" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                              </svg>
                            </div>
                            <div className="text-sm font-medium">SSO Integration</div>
                          </div>
                          <div className="text-xs text-gray-500">
                            Supports SAML, OIDC, and more
                          </div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <div className="flex items-center mb-2">
                            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center mr-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-700" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v-1l1-1 1-1-1-1H4a2 2 0 01-2-2V6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v4zm-6 5a4 4 0 100-8 4 4 0 000 8z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="text-sm font-medium">Audit Logs</div>
                          </div>
                          <div className="text-xs text-gray-500">
                            Comprehensive activity logging
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-3">Admin Controls</div>
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center mr-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-700" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                              </svg>
                            </div>
                            <div className="text-sm">User & Role Management</div>
                          </div>
                          <div className="flex h-5 items-center">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            <div className="text-xs text-green-600 ml-1">Active</div>
                          </div>
                        </div>
                        <div className="text-xs mb-3">
                          <div className="flex justify-between mb-1">
                            <div>Departments</div>
                            <div className="font-medium">12</div>
                          </div>
                          <div className="flex justify-between mb-1">
                            <div>User Roles</div>
                            <div className="font-medium">6</div>
                          </div>
                          <div className="flex justify-between">
                            <div>Active Users</div>
                            <div className="font-medium">204</div>
                          </div>
                        </div>
                        <div className="text-xs text-slate-600 flex justify-end">
                          View admin dashboard →
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-slate-200/50 rounded-full blur-xl"></div>
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-slate-100 rounded-full blur-xl"></div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
