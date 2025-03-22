import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { FontDemo } from "@/components/ui/font-demo";
import { cn } from "@/lib/utils";

/**
 * A dedicated page to showcase the typography system of FlowForm
 */
export default function FontsPage() {
  return (
    <div 
      className="min-h-screen text-white" 
      style={{
        backgroundImage: 'linear-gradient(to bottom, #020617, #0f172a)',
        backgroundSize: 'cover',
      }}
    >
      <div className="container mx-auto py-16 px-4 relative">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
        {/* Header with back button */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-16 pb-8 border-b border-white/10">
          <div>
            <h1 className="text-5xl font-fancy font-light tracking-tight mb-2">Typography</h1>
            <p className="text-white/60 max-w-xl">A complete guide to the FlowForm font system</p>
          </div>
          <Button
            asChild
            variant="ghost" 
            className="text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm self-start"
          >
            <Link href="/">← Back to home</Link>
          </Button>
        </header>

        {/* Font Family Cards */}
        <section className="mb-20">
          <h2 className="text-2xl font-fancy font-medium mb-8">Font Families</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group relative bg-white/5 hover:bg-white/10 transition backdrop-blur-sm p-8 rounded-xl border border-white/10 overflow-hidden">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity">
                <div className="absolute -right-10 -top-10 text-[400px] font-main font-black text-white/10 select-none">N</div>
              </div>
              <div className="relative z-10">
                <h3 className="font-main text-3xl font-medium mb-3">Neue Montreal</h3>
                <div className="h-0.5 w-16 bg-blue-500/80 mb-6"></div>
                <p className="text-white/70 mb-6 leading-relaxed">
                  Our primary sans-serif typeface for body text, UI elements, and general content.
                  Balanced, modern, and highly legible at all sizes. Neue Montreal provides a neutral
                  but distinctive foundation for our interface.
                </p>
                <div className="text-xs uppercase tracking-widest text-white/50 mb-2">Recommended usage</div>
                <ul className="text-white/70 space-y-1">
                  <li>• Body text and paragraphs</li>
                  <li>• UI elements and buttons</li>
                  <li>• Navigation and menus</li>
                  <li>• Form fields and labels</li>
                  <li>• Form instructions and hints</li>
                </ul>
              </div>
            </div>
            
            <div className="group relative bg-white/5 hover:bg-white/10 transition backdrop-blur-sm p-8 rounded-xl border border-white/10 overflow-hidden">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity">
                <div className="absolute -right-10 -top-10 text-[400px] font-fancy font-black text-white/10 select-none">E</div>
              </div>
              <div className="relative z-10">
                <h3 className="font-fancy text-3xl font-medium mb-3">Editorial New</h3>
                <div className="h-0.5 w-16 bg-indigo-500/80 mb-6"></div>
                <p className="text-white/70 mb-6 leading-relaxed">
                  Our accent serif typeface for headings, pull quotes, and special elements.
                  Editorial New provides an elegant, distinctive character with excellent contrast
                  to our primary font. It adds sophistication to key elements.
                </p>
                <div className="text-xs uppercase tracking-widest text-white/50 mb-2">Recommended usage</div>
                <ul className="text-white/70 space-y-1">
                  <li>• Headings and titles</li>
                  <li>• Form section headers</li>
                  <li>• Pull quotes and featured text</li>
                  <li>• Success messages and confirmations</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Type Scale Example */}
        <section className="mb-20">
          <h2 className="text-2xl font-fancy font-medium mb-8">Type Scale</h2>
          <div className="relative overflow-hidden rounded-xl border border-white/10">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 relative z-10 bg-black/40 backdrop-blur-md">
              <div className="p-8 border-b lg:border-b-0 lg:border-r border-white/10">
                <h3 className="text-2xl font-main mb-6 pb-4 border-b border-white/10">Neue Montreal Scale</h3>
                <div className="space-y-6">
                  {['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'].map((size, i) => (
                    <div key={i} className="flex items-baseline">
                      <div className="w-16 text-white/50 text-sm">{size}</div>
                      <div className={cn("font-main", `text-${size}`)}>
                        The quick brown fox
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-8">
                <h3 className="text-2xl font-fancy mb-6 pb-4 border-b border-white/10">Editorial New Scale</h3>
                <div className="space-y-6">
                  {['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'].map((size, i) => (
                    <div key={i} className="flex items-baseline">
                      <div className="w-16 text-white/50 text-sm">{size}</div>
                      <div className={cn("font-fancy", `text-${size}`)}>
                        The quick brown fox
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Font Demo */}
        <section className="mb-20">
          <h2 className="text-2xl font-fancy font-medium mb-8">Font Samples</h2>
          <div className="relative">
            
            <div className="relative z-10">
              <FontDemo fullWidth />
            </div>
          </div>
        </section>
        
        {/* Usage Examples */}
        <section className="mb-20">
          <h2 className="text-2xl font-fancy font-medium mb-8">Usage Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <h3 className="text-xl font-medium mb-1">Hero Section Example</h3>
                <p className="text-white/60 text-sm">Combining both fonts for impact</p>
              </div>
              <div className="p-8 bg-gradient-to-br from-blue-950/40 to-indigo-950/40 flex flex-col items-center justify-center text-center min-h-[300px]">
                <p className="font-fancy text-white/70 tracking-widest mb-2">CREATE</p>
                <h2 className="font-fancy text-4xl font-light mb-4">Beautiful Forms</h2>
                <p className="font-main text-white/80 max-w-sm">Build powerful and engaging forms with FlowForm's intuitive form builder</p>
                <Button className="mt-6">Start Building</Button>
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <h3 className="text-xl font-medium mb-1">Content Example</h3>
                <p className="text-white/60 text-sm">Article with proper hierarchy</p>
              </div>
              <div className="p-8 flex flex-col min-h-[300px]">
                <h2 className="font-fancy text-2xl font-medium mb-4">Creating Effective Forms</h2>
                <p className="font-main text-white/80 mb-4">Well-designed forms improve user experience and increase completion rates, with clear instructions and logical organization of fields.</p>
                <h3 className="font-fancy text-lg font-medium mb-2 mt-2">Form Structure</h3>
                <p className="font-main text-white/80 mb-4">A good form follows a logical structure, groups related fields together, and provides helpful validation feedback to guide users through the process.</p>
                <p className="font-main text-white/70 text-sm italic">Last updated: March 22, 2025</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
