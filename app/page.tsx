import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"

export default async function LandingPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Transform Your Health Journey with{" "}
              <span className="text-primary">SnapTrack</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mb-10">
              Your all-in-one solution for nutrition tracking, workout planning, and achieving your fitness goals.
              Smart, personalized, and designed for your success.
            </p>
            <div className="flex gap-4">
              {session ? (
                <Link href="/dashboard">
                  <Button size="lg">Go to Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button size="lg">Get Started</Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" size="lg">Sign In</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container px-4 mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose SnapTrack?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              title="Smart Nutrition Tracking"
              description="Effortlessly track your meals with our intelligent food database and get real-time insights into your nutrition."
              icon="🍎"
            />
            <FeatureCard
              title="Personalized Workout Plans"
              description="Get customized workout routines based on your goals, fitness level, and preferences."
              icon="💪"
            />
            <FeatureCard
              title="Progress Analytics"
              description="Visualize your progress with detailed charts and analytics to stay motivated and on track."
              icon="📊"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted/50">
        <div className="container px-4 mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <StepCard
              number="1"
              title="Create Account"
              description="Sign up in seconds and set your health goals"
            />
            <StepCard
              number="2"
              title="Track Food"
              description="Log your meals and track nutrition effortlessly"
            />
            <StepCard
              number="3"
              title="Get Plans"
              description="Receive personalized workout and meal plans"
            />
            <StepCard
              number="4"
              title="See Results"
              description="Track progress and achieve your goals"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of users who have transformed their lives with SnapTrack
          </p>
          {session ? (
            <Link href="/dashboard">
              <Button size="lg">Go to Dashboard</Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button size="lg">Get Started Now</Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="p-6 rounded-lg border bg-card text-card-foreground">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="relative p-6 rounded-lg border bg-card text-card-foreground">
      <div className="absolute -top-4 left-6 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
        {number}
      </div>
      <h3 className="text-xl font-semibold mb-2 mt-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}

