import { Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function CGMGraph() {
    return (
        <Card className="col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">Glucose Levels (CGM)</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed bg-muted/50">
                    <div className="text-center">
                        <p className="text-sm font-medium text-muted-foreground">Live Graph Placeholder</p>
                        <p className="text-xs text-muted-foreground">110 mg/dL • Stable</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
