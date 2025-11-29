import { cn } from "@/lib/utils"
import { Pill, Clock, AlertCircle, CheckCircle2, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface MedicationItemProps {
    id: string
    name: string
    dosage: string
    frequency: string
    time: string
    type: "chronic" | "acute"
    status: "taken" | "pending" | "missed"
    instructions?: string
    onToggleStatus: (id: string) => void
}

export function MedicationItem({ id, name, dosage, frequency, time, type, status, instructions, onToggleStatus }: MedicationItemProps) {
    return (
        <div className={cn(
            "group flex items-start gap-4 rounded-lg border p-3 transition-all hover:bg-accent/50",
            status === "taken" && "opacity-60"
        )}>
            <button
                onClick={() => onToggleStatus(id)}
                className={cn(
                    "mt-1 flex h-10 w-10 items-center justify-center rounded-full border transition-colors",
                    status === "taken"
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-muted-foreground hover:border-primary"
                )}
            >
                {status === "taken" ? <CheckCircle2 className="h-6 w-6" /> : <Pill className="h-5 w-5" />}
            </button>

            <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                    <h4 className={cn("font-medium leading-none", status === "taken" && "line-through")}>
                        {name} <span className="text-muted-foreground font-normal">({dosage})</span>
                    </h4>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {time}
                    </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{frequency}</span>
                    <span>•</span>
                    <span className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                        type === "chronic" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                    )}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                    </span>
                </div>

                {instructions && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {instructions}
                    </p>
                )}
            </div>

            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
            </Button>
        </div>
    )
}
