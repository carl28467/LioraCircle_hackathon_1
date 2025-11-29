import { cn } from "@/lib/utils"
import { CheckCircle2, Clock, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface ScheduleItemProps {
    id: string
    title: string
    time: string
    type: "medication" | "appointment" | "routine" | "exercise"
    status: "pending" | "completed" | "missed"
    description?: string
    member?: {
        name: string
        color: string // e.g., "bg-blue-500"
        avatar?: string
    }
    onToggleStatus: (id: string) => void
}

export function ScheduleItem({ id, title, time, type, status, description, member, onToggleStatus }: ScheduleItemProps) {
    const getTypeColor = (type: string) => {
        switch (type) {
            case "medication": return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
            case "appointment": return "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800"
            case "exercise": return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
            default: return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
        }
    }

    return (
        <div className={cn(
            "group flex items-start gap-4 rounded-lg border p-3 transition-all hover:bg-accent/50",
            status === "completed" && "opacity-60"
        )}>
            <button
                onClick={() => onToggleStatus(id)}
                className={cn(
                    "mt-1 flex h-5 w-5 items-center justify-center rounded-full border transition-colors",
                    status === "completed"
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-muted-foreground hover:border-primary"
                )}
            >
                {status === "completed" && <CheckCircle2 className="h-3.5 w-3.5" />}
            </button>

            <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                    <h4 className={cn("font-medium leading-none", status === "completed" && "line-through")}>
                        {title}
                    </h4>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {time}
                    </span>
                </div>

                {description && (
                    <p className="text-sm text-muted-foreground line-clamp-1">
                        {description}
                    </p>
                )}

                <div className="mt-2 flex items-center justify-between">
                    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", getTypeColor(type))}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                    </span>

                    {member && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full">
                            <div className={`h-2 w-2 rounded-full ${member.color}`} />
                            <span>{member.name}</span>
                        </div>
                    )}
                </div>
            </div>

            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
            </Button>
        </div>
    )
}
