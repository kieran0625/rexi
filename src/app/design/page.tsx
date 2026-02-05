
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { Badge } from "@/components/ui/badge";
import { Sparkles, Check, AlertCircle, Info, Moon, Sun } from "lucide-react";

const Label = ({ children, htmlFor }: { children: React.ReactNode, htmlFor?: string }) => (
  <label htmlFor={htmlFor} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
    {children}
  </label>
);

const Badge = ({ children, variant = "default" }: { children: React.ReactNode, variant?: "default" | "secondary" | "outline" | "destructive" }) => {
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "text-foreground border border-input hover:bg-accent hover:text-accent-foreground",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/80",
  };
  return (
    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variants[variant]}`}>
      {children}
    </div>
  );
};

const Alert = ({ children, variant = "default" }: { children: React.ReactNode, variant?: "default" | "destructive" }) => {
  const variants = {
    default: "bg-background text-foreground",
    destructive: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
  };
  return (
    <div className={`relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground ${variants[variant]}`}>
      {children}
    </div>
  );
};

const AlertTitle = ({ children }: { children: React.ReactNode }) => (
  <h5 className="mb-1 font-medium leading-none tracking-tight">{children}</h5>
);

const AlertDescription = ({ children }: { children: React.ReactNode }) => (
  <div className="text-sm [&_p]:leading-relaxed">{children}</div>
);


export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-background p-8 font-sans text-foreground transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="space-y-4 border-b pb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Design System</h1>
              <p className="mt-4 text-xl text-muted-foreground">
                A concise and advanced color system with WCAG 2.1 compliance.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Sun className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Color Palette */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Color Palette</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Primary */}
            <div className="space-y-3">
              <h3 className="font-semibold text-muted-foreground">Primary (Deep Blue)</h3>
              <div className="h-24 rounded-lg bg-primary shadow-sm flex items-end p-3 text-primary-foreground font-mono text-xs">
                var(--primary)
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div className="h-10 rounded bg-primary/90"></div>
                <div className="h-10 rounded bg-primary/80"></div>
                <div className="h-10 rounded bg-primary/60"></div>
                <div className="h-10 rounded bg-primary/40"></div>
              </div>
            </div>

            {/* Secondary */}
            <div className="space-y-3">
              <h3 className="font-semibold text-muted-foreground">Secondary (Slate)</h3>
              <div className="h-24 rounded-lg bg-secondary shadow-sm flex items-end p-3 text-secondary-foreground font-mono text-xs">
                var(--secondary)
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div className="h-10 rounded bg-secondary/90"></div>
                <div className="h-10 rounded bg-secondary/80"></div>
                <div className="h-10 rounded bg-secondary/60"></div>
                <div className="h-10 rounded bg-secondary/40"></div>
              </div>
            </div>

            {/* Accent */}
            <div className="space-y-3">
              <h3 className="font-semibold text-muted-foreground">Accent (Interactive)</h3>
              <div className="h-24 rounded-lg bg-accent shadow-sm flex items-end p-3 text-accent-foreground font-mono text-xs">
                var(--accent)
              </div>
            </div>

             {/* Destructive */}
             <div className="space-y-3">
              <h3 className="font-semibold text-muted-foreground">Destructive (Error)</h3>
              <div className="h-24 rounded-lg bg-destructive shadow-sm flex items-end p-3 text-destructive-foreground font-mono text-xs">
                var(--destructive)
              </div>
            </div>
          </div>

           {/* Neutrals */}
           <div className="space-y-3 pt-4">
              <h3 className="font-semibold text-muted-foreground">Neutrals & Surfaces</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="h-20 rounded border bg-background p-3 text-xs text-foreground flex items-end">Background</div>
                <div className="h-20 rounded border bg-card p-3 text-xs text-card-foreground flex items-end">Card</div>
                <div className="h-20 rounded border bg-popover p-3 text-xs text-popover-foreground flex items-end">Popover</div>
                <div className="h-20 rounded border bg-muted p-3 text-xs text-muted-foreground flex items-end">Muted</div>
                <div className="h-20 rounded border bg-border p-3 text-xs text-foreground flex items-end">Border</div>
              </div>
            </div>
        </section>

        {/* Components Showcase */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Component Showcase</h2>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Interactive Elements */}
            <Card>
              <CardHeader>
                <CardTitle>Interactive Elements</CardTitle>
                <CardDescription>Buttons, inputs, and form controls.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap gap-4">
                  <Button>Default Button</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button disabled>Disabled</Button>
                </div>
                
                <div className="grid gap-4 max-w-sm">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input type="email" id="email" placeholder="Email address" />
                  </div>
                  <div className="grid gap-2">
                     <Label>Badges</Label>
                     <div className="flex gap-2">
                       <Badge>Default</Badge>
                       <Badge variant="secondary">Secondary</Badge>
                       <Badge variant="outline">Outline</Badge>
                       <Badge variant="destructive">Destructive</Badge>
                     </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content & Feedback */}
            <Card>
              <CardHeader>
                <CardTitle>Content & Feedback</CardTitle>
                <CardDescription>Cards, alerts, and typography.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <Sparkles className="h-4 w-4" />
                  <AlertTitle>Heads up!</AlertTitle>
                  <AlertDescription>
                    This is an informational alert using the new color system.
                  </AlertDescription>
                </Alert>

                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    Your session has expired. Please log in again.
                  </AlertDescription>
                </Alert>

                <div className="rounded-lg bg-muted p-4">
                   <p className="text-sm text-muted-foreground">
                     This is muted text on a muted background. Used for secondary information, footnotes, or disabled states.
                     Contrast ratio is maintained for readability.
                   </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
