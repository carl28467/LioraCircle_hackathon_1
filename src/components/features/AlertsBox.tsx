import { AlertTriangle, AlertOctagon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const alerts = [
    { id: 1, type: "critical", message: "Grandma: Fall detected in Living Room", time: "2m ago" },
    { id: 2, type: "warning", message: "Mike: Glucose trending low (75 mg/dL)", time: "15m ago" },
]

export function AlertsBox() {
    if (alerts.length === 0) return null

    return (
        <Card className="border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/10">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg text-red-700 dark:text-red-400">
                    <AlertTriangle className="h-5 w-5" />
                    Critical Alerts
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {alerts.map((alert) => (
                        <div key={alert.id} className="flex items-start gap-3 rounded-md bg-white p-3 shadow-sm dark:bg-card">
                            <AlertOctagon className={cn(
                                "mt-0.5 h-5 w-5 shrink-0",
                                alert.type === "critical" ? "text-red-600" : "text-amber-500"
                            )} />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-foreground">{alert.message}</p>
                                <p className="text-xs text-muted-foreground">{alert.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
