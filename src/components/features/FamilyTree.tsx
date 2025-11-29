import { motion } from "framer-motion"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

export interface FamilyMember {
    id: number
    name: string
    role: string
    relationship: "parent" | "partner" | "child" | "sibling" | "grandparent" | "other"
    status: "good" | "warning" | "critical"
    color: string
}

interface FamilyTreeProps {
    members: FamilyMember[]
    onAddMember: () => void
    onMemberClick: (member: FamilyMember) => void
}

export function FamilyTree({ members, onAddMember, onMemberClick }: FamilyTreeProps) {
    return (
        <div className="h-[600px] w-full overflow-y-auto rounded-xl border border-border bg-background/50 p-6 shadow-sm">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {/* Add Member Button */}
                <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={onAddMember}
                    className="flex aspect-square flex-col items-center justify-center gap-2 rounded-full border-2 border-dashed border-muted-foreground/50 bg-muted/20 transition-all hover:bg-muted/40 hover:border-primary/50 group"
                    title="Add Family Member"
                >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110">
                        <Plus className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">Add Member</span>
                </motion.button>

                {/* Family Members */}
                {members.map((member, index) => (
                    <motion.div
                        key={member.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex flex-col items-center gap-3"
                    >
                        <button
                            onClick={() => onMemberClick(member)}
                            className={cn(
                                "relative flex aspect-square w-full max-w-[120px] items-center justify-center rounded-full border-4 transition-all hover:scale-105 hover:shadow-lg",
                                member.color,
                                "bg-background shadow-sm"
                            )}
                        >
                            <span className="text-3xl font-bold text-foreground">{member.name[0]}</span>

                            {/* Status Indicator */}
                            <div className={cn(
                                "absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-background",
                                member.status === "good" ? "bg-green-500" :
                                    member.status === "warning" ? "bg-yellow-500" : "bg-red-500"
                            )} />
                        </button>

                        <div className="text-center">
                            <h3 className="font-semibold text-foreground truncate max-w-[120px]">{member.name}</h3>
                            <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
