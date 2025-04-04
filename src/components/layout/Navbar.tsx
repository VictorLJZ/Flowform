import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"

const products = [
  {
    title: "Corporate Cards",
    description: "Control spend before it happens.",
    href: "/products/cards",
  },
  {
    title: "Expense Management",
    description: "Eliminate expense reports.",
    href: "/products/expense",
  },
  {
    title: "Accounts Payable",
    description: "Process AP in minutes.",
    href: "/products/ap",
  },
  {
    title: "Travel",
    description: "Keep T&E in check.",
    href: "/products/travel",
  },
]

const solutions = [
  {
    title: "Integrations",
    description: "Connect to your finance stack.",
    href: "/solutions/integrations",
  },
  {
    title: "Reporting",
    description: "Get full visibility in real-time.",
    href: "/solutions/reporting",
  },
  {
    title: "Global Ready",
    description: "Spend globally, operate locally.",
    href: "/solutions/global",
  },
  {
    title: "Intelligence",
    description: "Put AI to work for you.",
    href: "/solutions/intelligence",
  },
]

const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full bg-white z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          {/* Left section - Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <Image 
                src="/logo.svg" 
                alt="FlowForm Logo" 
                width={120} 
                height={24} 
                priority
              />
            </Link>
          </div>

          {/* Center section - Main Navigation */}
          <div className="absolute inset-0 flex justify-center">
            <div className="hidden md:flex items-center">
              <NavigationMenu className="z-50">
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Products</NavigationMenuTrigger>
                    <NavigationMenuContent className="sm:left-0 md:left-1/2 md:-translate-x-1/2">
                      <div className="w-[550px] p-4">
                        <div className="grid grid-cols-2 gap-3">
                          {products.map((product) => (
                            <NavigationMenuLink
                              key={product.href}
                              href={product.href}
                              className={cn(
                                "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-50 focus:bg-gray-50"
                              )}
                            >
                              <div className="text-sm font-medium leading-none">{product.title}</div>
                              <p className="line-clamp-2 text-sm leading-snug text-gray-500">
                                {product.description}
                              </p>
                            </NavigationMenuLink>
                          ))}
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Solutions</NavigationMenuTrigger>
                    <NavigationMenuContent className="sm:left-0 md:left-1/2 md:-translate-x-1/2">
                      <div className="w-[550px] p-4">
                        <div className="grid grid-cols-2 gap-3">
                          {solutions.map((solution) => (
                            <NavigationMenuLink
                              key={solution.href}
                              href={solution.href}
                              className={cn(
                                "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-50 focus:bg-gray-50"
                              )}
                            >
                              <div className="text-sm font-medium leading-none">{solution.title}</div>
                              <p className="line-clamp-2 text-sm leading-snug text-gray-500">
                                {solution.description}
                              </p>
                            </NavigationMenuLink>
                          ))}
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link href="/customers" legacyBehavior passHref>
                      <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                        Customers
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link href="/pricing" legacyBehavior passHref>
                      <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                        Pricing
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>

          {/* Right section - Auth Buttons */}
          <div className="flex-shrink-0 flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-primary text-white hover:bg-primary/90">
                See a demo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar 