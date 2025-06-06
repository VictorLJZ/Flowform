import { GalleryVerticalEnd } from "lucide-react"
import { LoginForm } from "@/components/auth"
import Link from "next/link"
import { Suspense } from "react"
import Image from 'next/image'

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            FlowForm
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <Image
          src="/images/zip.webp"
          alt="Form builder illustration"
          fill
          style={{ objectFit: 'cover' }}
          className="dark:brightness-[0.3] dark:contrast-125"
          priority
        />
      </div>
    </div>
  )
}
