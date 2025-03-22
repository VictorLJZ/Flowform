"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full py-4 px-6 flex justify-between items-center border-b">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">FlowForm</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="outline">Dashboard</Button>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 gap-8">
        <div className="text-center max-w-2xl">
          <h2 className="text-4xl font-bold mb-4">Build Better Forms with AI</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Create, manage, and analyze forms with powerful AI assistance. Streamline your data collection and boost productivity.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="px-8">Get Started</Button>
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl w-full mt-12">
          <div className="border rounded-lg p-6 bg-card">
            <h3 className="text-xl font-semibold mb-2">AI-Powered Creation</h3>
            <p className="text-muted-foreground">Generate forms instantly using natural language. Just describe what you need.</p>
          </div>
          <div className="border rounded-lg p-6 bg-card">
            <h3 className="text-xl font-semibold mb-2">Intelligent Analysis</h3>
            <p className="text-muted-foreground">Get AI insights from your form submissions with automatic data processing.</p>
          </div>
          <div className="border rounded-lg p-6 bg-card">
            <h3 className="text-xl font-semibold mb-2">Customizable Templates</h3>
            <p className="text-muted-foreground">Start with pre-built templates or create your own custom form designs.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
