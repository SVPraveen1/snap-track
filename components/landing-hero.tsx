import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function LandingHero() {
  return (
    <section className="py-24 md:py-32 hero-pattern">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none gradient-heading">
                Track Your Calories with AI Precision
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Calorimate uses AI to identify food from photos and barcodes, making calorie tracking effortless and
                accurate.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/register">
                <Button size="lg" className="w-full group">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full">
                  Log In
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative h-[350px] w-full md:h-[450px] lg:h-[450px] xl:h-[550px] rounded-2xl overflow-hidden bg-muted">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-background/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[80%] h-[80%] bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 flex flex-col">
                  <div className="h-6 flex items-center space-x-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                    <div className="h-6 w-24 bg-primary/20 rounded-md mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-gray-200 dark:bg-gray-600 rounded"></div>
                      <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-600 rounded"></div>
                      <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-600 rounded"></div>
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-2">
                      <div className="h-20 bg-primary/10 rounded-lg"></div>
                      <div className="h-20 bg-primary/10 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

