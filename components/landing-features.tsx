import { Camera, Barcode, LineChart, Bell } from "lucide-react"

export function LandingFeatures() {
  return (
    <section className="py-16 md:py-24 bg-secondary/50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl gradient-heading">Key Features</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
              Calorimate combines cutting-edge AI with intuitive design to make calorie tracking simple and accurate.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 mt-12">
          <div className="feature-card flex flex-col items-center space-y-3 rounded-xl border p-6 bg-background">
            <div className="rounded-full bg-primary/10 p-3">
              <Camera className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">AI Image Recognition</h3>
            <p className="text-sm text-muted-foreground text-center">
              Take a photo of your meal and our AI will identify the food and calculate calories.
            </p>
          </div>
          <div className="feature-card flex flex-col items-center space-y-3 rounded-xl border p-6 bg-background">
            <div className="rounded-full bg-primary/10 p-3">
              <Barcode className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Barcode Scanning</h3>
            <p className="text-sm text-muted-foreground text-center">
              Scan packaged food barcodes for instant nutritional information.
            </p>
          </div>
          <div className="feature-card flex flex-col items-center space-y-3 rounded-xl border p-6 bg-background">
            <div className="rounded-full bg-primary/10 p-3">
              <LineChart className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Nutrition Insights</h3>
            <p className="text-sm text-muted-foreground text-center">
              Get personalized insights about your eating habits and nutritional balance.
            </p>
          </div>
          <div className="feature-card flex flex-col items-center space-y-3 rounded-xl border p-6 bg-background">
            <div className="rounded-full bg-primary/10 p-3">
              <Bell className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Smart Reminders</h3>
            <p className="text-sm text-muted-foreground text-center">
              Set personalized reminders to track your meals consistently throughout the day.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

