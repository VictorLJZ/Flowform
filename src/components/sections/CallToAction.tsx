import { Button } from "@/components/ui/button"
import Link from "next/link"

const CallToAction = () => {
  return (
    <section className="py-24 bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-medium text-white mb-6">
            Ready to transform your forms?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of teams already collecting better data with FlowForm.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 text-lg px-8"
              >
                Get started for free
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 text-lg px-8"
              >
                Contact sales
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-white/80">
            Free plan includes all features · No credit card required
          </p>
        </div>
      </div>
    </section>
  )
}

export default CallToAction
