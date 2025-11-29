import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Trash2, AlertCircle, CheckCircle2 } from "lucide-react"

export interface InventoryItemProps {
    id: string
    name: string
    category: "fridge" | "pantry" | "freezer"
    quantity: string
    expiryDate: string
    status: "good" | "expiring" | "expired"
    onDelete: (id: string) => void
}

export function InventoryItem({ id, name, quantity, expiryDate, status, onDelete }: InventoryItemProps) {
    return (
        <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3 shadow-sm transition-all hover:bg-accent/50">
            <div className="flex items-center gap-3">
                <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border",
                    status === "good" && "border-green-500 bg-green-500/10 text-green-500",
                    status === "expiring" && "border-yellow-500 bg-yellow-500/10 text-yellow-500",
                    status === "expired" && "border-red-500 bg-red-500/10 text-red-500"
                )}>
                    {status === "good" && <CheckCircle2 className="h-5 w-5" />}
                    {status === "expiring" && <AlertCircle className="h-5 w-5" />}
                    {status === "expired" && <AlertCircle className="h-5 w-5" />}
                </div>
                <div>
                    <h4 className="font-medium leading-none">{name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                        {quantity} • Expires {expiryDate}
                    </p>
                </div>
            </div>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(id)}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    )
}
