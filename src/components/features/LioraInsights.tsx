import { Sparkles } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface LioraInsightsProps {
    title?: string
    icon?: LucideIcon
    children?: React.ReactNode
    className?: string
}

export function LioraInsights({ title = "Liora Insights", icon: Icon = Sparkles, children, className }: LioraInsightsProps) {
    return (
        <Card className={cn("bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20", className)}>
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <Icon className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg text-primary">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {children ? (
                    <div className="space-y-4">
                        {children}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="rounded-lg bg-card/50 p-4 text-sm leading-relaxed text-card-foreground shadow-sm">
                            <p>
                                <span className="font-semibold">Observation:</span> I've noticed your average glucose levels have been slightly elevated (145 mg/dL) over the last two weeks.
                            </p>
                            <p className="mt-2">
                                <span className="font-semibold">Recommendation:</span> Consider increasing your post-dinner walk by 15 minutes. I've also found a low-carb recipe for tonight's dinner.
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
