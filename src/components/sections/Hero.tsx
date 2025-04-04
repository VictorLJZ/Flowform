import { Button } from "@/components/ui/button"
import Link from "next/link"

const Hero = () => {
  return (
    <section className="relative pt-32 pb-24 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-medium tracking-tight text-gray-900 mb-8">
            Forms that flow like{" "}
            <span className="text-primary">natural conversation</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Create beautiful, conversational forms that engage users and collect better data. Powered by AI for smarter interactions.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/signup">
              <Button size="lg" className="bg-primary text-white hover:bg-primary/90 text-lg px-8">
                Get started for free
              </Button>
            </Link>
            <Link href="/templates">
              <Button size="lg" variant="outline" className="text-lg px-8">
                View templates
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-sm text-gray-500">
            No credit card required · Free plan available
          </p>
        </div>
      </div>
    </section>
  )
}

export default Hero 