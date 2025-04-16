import { cn } from "@/lib/utils";

interface FontDemoProps {
  className?: string;
  fullWidth?: boolean;
}

export function FontDemo({ className, fullWidth = false }: FontDemoProps) {
  return (
    <div className={cn(
      "space-y-8 p-8 rounded-lg bg-black/40 backdrop-blur-md",
      fullWidth ? "w-full" : "max-w-xl mx-auto",
      className
    )}>
      <div className="space-y-2">
        <h2 className="text-xl text-white/70">Main Font (Neue Montreal)</h2>
        <p className="font-main text-white font-normal">
          Regular - The quick brown fox jumps over the lazy dog
        </p>
        <p className="font-main text-white font-light">
          Light - The quick brown fox jumps over the lazy dog
        </p>
        <p className="font-main text-white font-medium">
          Medium - The quick brown fox jumps over the lazy dog
        </p>
        <p className="font-main text-white font-bold">
          Bold - The quick brown fox jumps over the lazy dog
        </p>
        <p className="font-main text-white italic">
          Italic - The quick brown fox jumps over the lazy dog
        </p>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl text-white/70">Fancy Font (Editorial New)</h2>
        <p className="font-fancy text-white font-thin">
          Thin - The quick brown fox jumps over the lazy dog
        </p>
        <p className="font-fancy text-white font-light">
          Light - The quick brown fox jumps over the lazy dog
        </p>
        <p className="font-fancy text-white font-normal">
          Regular - The quick brown fox jumps over the lazy dog
        </p>
        <p className="font-fancy text-white font-medium">
          Medium - The quick brown fox jumps over the lazy dog
        </p>
        <p className="font-fancy text-white font-bold">
          Bold - The quick brown fox jumps over the lazy dog
        </p>
        <p className="font-fancy text-white font-extrabold">
          Ultra Bold - The quick brown fox jumps over the lazy dog
        </p>
        <p className="font-fancy text-white font-black">
          Heavy - The quick brown fox jumps over the lazy dog
        </p>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl text-white/70">Typography Presets</h2>
        <h1 className="text-heading-1 text-white">Heading 1</h1>
        <h2 className="text-heading-2 text-white">Heading 2</h2>
        <h3 className="text-heading-3 text-white">Heading 3</h3>
        <h4 className="text-heading-4 text-white">Heading 4</h4>
        <div className="text-body text-white">Body Text</div>
        <div className="text-body-small text-white">Small Body Text</div>
        <div className="text-caption text-white">CAPTION TEXT</div>
        <div className="text-code text-white">Code: console.log(&apos;Hello World&apos;);</div>
      </div>
    </div>
  );
}
