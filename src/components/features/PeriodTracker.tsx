import { Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function PeriodTracker() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">Cycle Tracking</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center space-y-2 py-4">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-pink-200 bg-pink-50 dark:bg-pink-950/30">
                        <div className="text-center">
                            <span className="block text-2xl font-bold text-pink-600 dark:text-pink-400">Day 14</span>
                            <span className="text-xs text-muted-foreground">Ovulation</span>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Next period in 14 days</p>
                </div>
            </CardContent>
        </Card>
    )
}
