import { Button } from "@/components/ui/button"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import Navbar from "@/components/layout/Navbar"
import { Check } from "lucide-react"

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-medium text-gray-900 mb-4">
              Choose your plan
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started with our free plan or upgrade to unlock all features.
              No credit card required for the free plan.
            </p>
          </div>

          {/* Pricing Tabs */}
          <Tabs defaultValue="monthly" className="max-w-4xl mx-auto mb-16">
            <TabsList className="grid w-64 grid-cols-2 mx-auto mb-8">
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">
                Yearly <span className="ml-1.5 text-xs text-green-600">Save 16%</span>
              </TabsTrigger>
            </TabsList>

            {/* Monthly Plans */}
            <TabsContent value="monthly">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Free Plan */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-xl font-medium text-gray-900 mb-2">Free</h3>
                    <p className="text-gray-600 mb-6 h-12">Get started with essential form features.</p>
                    <div className="mb-6">
                      <p className="text-4xl font-bold text-gray-900">$0</p>
                      <p className="text-gray-500 text-sm">Forever free</p>
                    </div>
                    <Button className="w-full mb-6">Get started</Button>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mr-2" />
                        <span className="text-gray-600 text-sm">3 forms</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mr-2" />
                        <span className="text-gray-600 text-sm">100 responses per month</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mr-2" />
                        <span className="text-gray-600 text-sm">Basic form elements</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mr-2" />
                        <span className="text-gray-600 text-sm">FlowForm branding</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Pro Plan */}
                <div className="bg-white rounded-xl border-2 border-primary overflow-hidden shadow-lg relative">
                  <div className="absolute top-0 left-0 right-0 bg-primary text-white text-xs font-medium py-1 text-center">
                    MOST POPULAR
                  </div>
                  <div className="p-6 pt-8">
                    <h3 className="text-xl font-medium text-gray-900 mb-2">Pro</h3>
                    <p className="text-gray-600 mb-6 h-12">Perfect for professionals and small teams.</p>
                    <div className="mb-6">
                      <p className="text-4xl font-bold text-gray-900">$29</p>
                      <p className="text-gray-500 text-sm">per month</p>
                    </div>
                    <Button className="w-full mb-6 bg-primary hover:bg-primary/90">Get started</Button>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mr-2" />
                        <span className="text-gray-600 text-sm">Unlimited forms</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mr-2" />
                        <span className="text-gray-600 text-sm">1,000 responses per month</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mr-2" />
                        <span className="text-gray-600 text-sm">Remove FlowForm branding</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mr-2" />
                        <span className="text-gray-600 text-sm">Custom form URLs</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mr-2" />
                        <span className="text-gray-600 text-sm">Advanced form elements</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mr-2" />
                        <span className="text-gray-600 text-sm">Basic integrations</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Business Plan */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-xl font-medium text-gray-900 mb-2">Business</h3>
                    <p className="text-gray-600 mb-6 h-12">For businesses requiring advanced features.</p>
                    <div className="mb-6">
                      <p className="text-4xl font-bold text-gray-900">$99</p>
                      <p className="text-gray-500 text-sm">per month</p>
                    </div>
                    <Button className="w-full mb-6" variant="outline">Get started</Button>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mr-2" />
                        <span className="text-gray-600 text-sm">Everything in Pro, plus:</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mr-2" />
                        <span className="text-gray-600 text-sm">10,000 responses per month</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mr-2" />
                        <span className="text-gray-600 text-sm">Advanced analytics</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mr-2" />
                        <span className="text-gray-600 text-sm">Advanced AI generation</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mr-2" />
                        <span className="text-gray-600 text-sm">Priority support</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mr-2" />
                        <span className="text-gray-600 text-sm">Premium integrations</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Yearly Plans */}
            <TabsContent value="yearly">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Free Plan */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-xl font-medium text-gray-900 mb-2">Free</h3>
                    <p className="text-gray-600 mb-6 h-12">Get started with essential form features.</p>
                    <div className="mb-6">
                      <p className="text-4xl font-bold text-gray-900">$0</p>
                      <p className="text-gray-500 text-sm">Forever free</p>
                    </div>
                    <Button className="w-full mb-6">Get started</Button>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mr-2" />
                        <span className="text-gray-600 text-sm">3 forms</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mr-2" />
                        <span className="text-gray-600 text-sm">100 responses per month</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mr-2" />
                        <span className="text-gray-600 text-sm">Basic form elements</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mr-2" />
                        <span className="text-gray-600 text-sm">FlowForm branding</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Pro Plan */}
                <div className="bg-white rounded-xl border-2 border-primary overflow-hidden shadow-lg relative">
                  <div className="absolute top-0 left-0 right-0 bg-primary text-white text-xs font-medium py-1 text-center">
                    MOST POPULAR
                  </div>
                  <div className="p-6 pt-8">
                    <h3 className="text-xl font-medium text-gray-900 mb-2">Pro</h3>
                    <p className="text-gray-600 mb-6 h-12">Perfect for professionals and small teams.</p>
                    <div className="mb-6">
                      <p className="text-4xl font-bold text-gray-900">$25</p>
                      <p className="text-gray-500 text-sm">per month, billed annually</p>
                    </div>
                    <Button className="w-full mb-6 bg-primary hover:bg-primary/90">Get started</Button>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mr-2" />
                        <span className="text-gray-600 text-sm">Unlimited forms</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mr-2" />
                        <span className="text-gray-600 text-sm">1,000 responses per month</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mr-2" />
                        <span className="text-gray-600 text-sm">Remove FlowForm branding</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mr-2" />
                        <span className="text-gray-600 text-sm">Custom form URLs</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mr-2" />
                        <span className="text-gray-600 text-sm">Advanced form elements</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mr-2" />
                        <span className="text-gray-600 text-sm">Basic integrations</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Business Plan */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-xl font-medium text-gray-900 mb-2">Business</h3>
                    <p className="text-gray-600 mb-6 h-12">For businesses requiring advanced features.</p>
                    <div className="mb-6">
                      <p className="text-4xl font-bold text-gray-900">$83</p>
                      <p className="text-gray-500 text-sm">per month, billed annually</p>
                    </div>
                    <Button className="w-full mb-6" variant="outline">Get started</Button>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mr-2" />
                        <span className="text-gray-600 text-sm">Everything in Pro, plus:</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mr-2" />
                        <span className="text-gray-600 text-sm">10,000 responses per month</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mr-2" />
                        <span className="text-gray-600 text-sm">Advanced analytics</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mr-2" />
                        <span className="text-gray-600 text-sm">Advanced AI generation</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mr-2" />
                        <span className="text-gray-600 text-sm">Priority support</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mr-2" />
                        <span className="text-gray-600 text-sm">Premium integrations</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Enterprise Section */}
          <div className="max-w-4xl mx-auto bg-gray-50 rounded-xl p-8 md:p-12">
            <div className="md:flex items-center gap-8">
              <div className="md:w-2/3 mb-6 md:mb-0">
                <h3 className="text-2xl font-medium text-gray-900 mb-4">Enterprise</h3>
                <p className="text-gray-600 mb-4">
                  Need a custom solution for your organization? Our enterprise plan includes custom branding, advanced security features, and dedicated support.
                </p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mb-6">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-primary flex-shrink-0 mr-2" />
                    <span className="text-gray-600 text-sm">Unlimited responses</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-primary flex-shrink-0 mr-2" />
                    <span className="text-gray-600 text-sm">Custom branding</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-primary flex-shrink-0 mr-2" />
                    <span className="text-gray-600 text-sm">SSO authentication</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-primary flex-shrink-0 mr-2" />
                    <span className="text-gray-600 text-sm">Dedicated support</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-primary flex-shrink-0 mr-2" />
                    <span className="text-gray-600 text-sm">SLA guarantees</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-primary flex-shrink-0 mr-2" />
                    <span className="text-gray-600 text-sm">Advanced security</span>
                  </li>
                </ul>
              </div>
              <div className="md:w-1/3 text-center md:text-left">
                <Button size="lg" className="bg-gray-900 hover:bg-gray-800 text-white">
                  Contact Sales
                </Button>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto mt-24">
            <h2 className="text-3xl font-medium text-gray-900 mb-8 text-center">
              Frequently asked questions
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  How does the free plan work?
                </h3>
                <p className="text-gray-600">
                  Our free plan includes 3 forms and 100 responses per month. You can use all the basic form elements and integrations. It's perfect for individuals or small projects.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Can I upgrade or downgrade at any time?
                </h3>
                <p className="text-gray-600">
                  Yes, you can upgrade, downgrade, or cancel your subscription at any time. If you downgrade or cancel, you'll continue to have access to your current plan until the end of your billing period.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Do you offer a discount for nonprofits or educational institutions?
                </h3>
                <p className="text-gray-600">
                  Yes, we offer special pricing for nonprofit organizations and educational institutions. Please contact our sales team for more information.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  What happens if I exceed my monthly response limit?
                </h3>
                <p className="text-gray-600">
                  If you reach your monthly response limit, you'll have the option to upgrade to a higher plan or purchase additional responses. We'll never delete your data or forms.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
} 