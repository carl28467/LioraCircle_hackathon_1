import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Brain, Network, Activity, Database, Sparkles } from "lucide-react"

export default function LioraMemory() {
    const [viewMode, setViewMode] = useState<"family" | "individual">("family")

    // Mock Data for Memory Stream
    const memories = [
        { id: 1, date: "Today, 10:30 AM", type: "insight", content: "Noticed a correlation between Dad's high stress and missed medication.", category: "Health Pattern" },
        { id: 2, date: "Yesterday, 6:15 PM", type: "preference", content: "Learned that Mom prefers vegan options for dinner on Mondays.", category: "Dietary Preference" },
        { id: 3, date: "Nov 25, 2025", type: "event", content: "Logged annual physical results for Mike. Cholesterol levels improved.", category: "Health Milestone" },
        { id: 4, date: "Nov 20, 2025", type: "insight", content: "Detected irregular sleep patterns for the whole family during exam week.", category: "Lifestyle Pattern" },
    ]

    return (
        <div className="flex h-[calc(100vh-4rem)] flex-col gap-4 p-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Brain className="h-6 w-6 text-primary" /> Liora Memory
                    </h2>
                    <p className="text-muted-foreground">Visualizing the family's accumulated health and lifestyle data.</p>
                </div>
                <div className="flex bg-secondary rounded-lg p-1">
                    <button
                        onClick={() => setViewMode("family")}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === "family" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        Family View
                    </button>
                    <button
                        onClick={() => setViewMode("individual")}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === "individual" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        Individual View
                    </button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3 h-full overflow-hidden">
                {/* Left Col: Stats & Graph */}
                <div className="flex flex-col gap-4 md:col-span-2 overflow-y-auto pr-2">

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                                <Database className="h-5 w-5 text-blue-500" />
                                <div>
                                    <div className="text-2xl font-bold">1,240</div>
                                    <div className="text-xs text-muted-foreground">Data Points Analyzed</div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                                <Network className="h-5 w-5 text-purple-500" />
                                <div>
                                    <div className="text-2xl font-bold">15</div>
                                    <div className="text-xs text-muted-foreground">Patterns Identified</div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                                <Sparkles className="h-5 w-5 text-yellow-500" />
                                <div>
                                    <div className="text-2xl font-bold">8</div>
                                    <div className="text-xs text-muted-foreground">Active Insights</div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Knowledge Graph Visualization (Mock) */}
                    <Card className="flex-1 min-h-[300px] flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Network className="h-4 w-4" /> Knowledge Graph
                            </CardTitle>
                            <CardDescription>Visualizing connections between family members, health, and habits.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex items-center justify-center bg-secondary/20 m-4 rounded-lg border border-dashed relative overflow-hidden">
                            {/* Simple CSS-based node visualization mock */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="relative h-64 w-64">
                                    {/* Central Node */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-16 bg-primary/20 rounded-full flex items-center justify-center border-2 border-primary z-10">
                                        <span className="font-bold text-primary text-xs">Family</span>
                                    </div>

                                    {/* Satellite Nodes */}
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 h-12 w-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center border border-blue-500 text-[10px] text-center">
                                        Health
                                    </div>
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-12 w-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center border border-green-500 text-[10px] text-center">
                                        Diet
                                    </div>
                                    <div className="absolute top-1/2 left-0 -translate-y-1/2 h-12 w-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center border border-purple-500 text-[10px] text-center">
                                        Sleep
                                    </div>
                                    <div className="absolute top-1/2 right-0 -translate-y-1/2 h-12 w-12 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center border border-orange-500 text-[10px] text-center">
                                        Activity
                                    </div>

                                    {/* Connecting Lines (SVG) */}
                                    <svg className="absolute inset-0 h-full w-full pointer-events-none -z-10">
                                        <line x1="50%" y1="50%" x2="50%" y2="10%" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2" />
                                        <line x1="50%" y1="50%" x2="50%" y2="90%" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2" />
                                        <line x1="50%" y1="50%" x2="10%" y2="50%" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2" />
                                        <line x1="50%" y1="50%" x2="90%" y2="50%" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2" />
                                    </svg>
                                </div>
                            </div>
                            <p className="absolute bottom-4 text-xs text-muted-foreground">Interactive graph visualization would go here.</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Col: Memory Stream */}
                <Card className="h-full flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Activity className="h-4 w-4" /> Memory Stream
                        </CardTitle>
                        <CardDescription>Recent learnings and observations.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto pr-2">
                        <div className="space-y-6 relative pl-4 border-l border-border ml-2">
                            {memories.map((memory) => (
                                <div key={memory.id} className="relative">
                                    <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-primary border-2 border-background" />
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                                {memory.category}
                                            </span>
                                            <span className="text-xs text-muted-foreground">{memory.date}</span>
                                        </div>
                                        <p className="text-sm text-foreground leading-snug">
                                            {memory.content}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
