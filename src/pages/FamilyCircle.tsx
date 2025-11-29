import { useState, useEffect } from "react"
import { FamilyTree } from "@/components/features/FamilyTree"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/context/AuthContext"
import { supabase } from "@/lib/supabase"

export default function FamilyCircle() {
    const { profile } = useAuth()
    const [members, setMembers] = useState<any[]>([])
    const [selectedMember, setSelectedMember] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [familyCode, setFamilyCode] = useState<string | null>(null)

    useEffect(() => {
        const fetchFamily = async () => {
            if (!profile) return

            let currentFamilyId = profile.family_id

            // Self-healing: If no family_id but user is Pioneer, try to find their family
            if (!currentFamilyId && profile.profile_data?.role === 'pioneer') {
                console.log("FamilyCircle: Pioneer missing family_id, searching...")
                const { data: family } = await supabase
                    .from("families")
                    .select("id")
                    .eq("pioneer_id", profile.id)
                    .maybeSingle()

                if (family) {
                    console.log("FamilyCircle: Found family for pioneer:", family.id)
                    currentFamilyId = family.id
                    // Optional: Update profile in background
                    supabase.from("profiles").update({ family_id: family.id }).eq("id", profile.id).then(() => {
                        console.log("FamilyCircle: Profile healed")
                    })
                }
            }

            if (!currentFamilyId) {
                console.log("FamilyCircle: No family_id found")
                setLoading(false)
                return
            }

            try {
                // Fetch members directly from Supabase
                const { data: membersData, error: membersError } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("family_id", currentFamilyId)

                if (membersError) throw membersError

                // Fetch family details (for code) directly from Supabase
                const { data: familyData, error: familyError } = await supabase
                    .from("families")
                    .select("*")
                    .eq("id", currentFamilyId)
                    .single()

                if (familyError) throw familyError

                if (familyData) {
                    setFamilyCode(familyData.invite_code)
                }

                if (membersData) {
                    console.log("FamilyCircle: Raw members data:", membersData)
                    // Transform data to match FamilyTree component requirements
                    const transformedMembers = membersData.map((p: any, index: number) => {
                        // Determine role and relationship
                        // This is a basic mapping. In a real app, you'd have a relationships table.

                        const role = p.profile_data?.role || "Member";
                        const relationship = p.profile_data?.relationship || "other";

                        return {
                            id: p.id,
                            name: p.full_name || `Member ${index + 1}`,
                            role: role,
                            relationship: relationship,
                            status: (p.profile_data?.status as any) || "good",
                            color: (p.profile_data?.color as string) || "border-green-500",
                            sharedData: {
                                vitals: true, // Default to true for now or fetch from settings
                                mood: true,
                                activity: true,
                                medications: false
                            },
                            details: {
                                mood: (p.profile_data?.mood as string) || "Neutral",
                                lastActive: "Just now", // Placeholder
                                steps: (p.profile_data?.steps as string) || "0",
                                sleep: (p.profile_data?.sleep as string) || "-"
                            }
                        }
                    })
                    console.log("FamilyCircle: Transformed members:", transformedMembers)
                    setMembers(transformedMembers)
                }
            } catch (error) {
                console.error("Error fetching family members:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchFamily()
    }, [profile?.family_id, profile?.id])

    const handleAddMember = () => {
        // Logic to invite member (e.g., show modal with invite code)
        if (familyCode) {
            alert(`Invite code: ${familyCode}`)
        }
    }

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading family circle...</div>
    }

    return (
        <div className="flex h-[calc(100vh-4rem)] flex-col gap-4 p-4 md:flex-row">
            {/* Main Tree Area */}
            <div className="flex-1">
                <Card className="h-full border-none shadow-none bg-transparent">
                    <CardHeader>
                        <CardTitle>My Circle</CardTitle>
                        <CardDescription>
                            {members.length === 1
                                ? "You are the Pioneer. Start building your circle."
                                : `${members.length} Family Members`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[600px] p-0">
                        <FamilyTree
                            members={members}
                            onAddMember={handleAddMember}
                            onMemberClick={setSelectedMember}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Side Panel Area */}
            <div className="flex w-full flex-col gap-4 md:w-80">
                {/* Family Code Card */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Family Code</CardTitle>
                        <CardDescription>Share this code to invite members.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between rounded-md border bg-secondary p-2">
                            <code className="text-lg font-bold tracking-widest">{familyCode || "Loading..."}</code>
                            <button className="text-xs font-medium text-primary hover:underline">Copy</button>
                        </div>
                    </CardContent>
                </Card>

                {/* Member Details (Visible when member selected) */}
                {selectedMember ? (
                    <Card className="animate-in slide-in-from-right-10 fade-in">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className={`flex h-12 w-12 items-center justify-center rounded-full border-2 bg-secondary text-xl font-bold ${selectedMember.color}`}>
                                    {selectedMember.name[0]}
                                </div>
                                <div>
                                    <CardTitle>{selectedMember.name}</CardTitle>
                                    <CardDescription>{selectedMember.role}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Status Section */}
                            <div className="space-y-1">
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</span>
                                <div className="flex items-center gap-2">
                                    <div className={`h-2.5 w-2.5 rounded-full ${selectedMember.status === 'good' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                    <span className="font-medium capitalize">{selectedMember.status}</span>
                                    <span className="text-xs text-muted-foreground ml-auto">{selectedMember.details.lastActive}</span>
                                </div>
                            </div>

                            <div className="h-px bg-border" />

                            {/* Shared Data Section */}
                            <div className="space-y-3">
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Shared Insights</span>

                                {selectedMember.sharedData.mood && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Current Mood</span>
                                        <span className="font-medium">{selectedMember.details.mood}</span>
                                    </div>
                                )}

                                {selectedMember.sharedData.activity && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Steps Today</span>
                                        <span className="font-medium">{selectedMember.details.steps}</span>
                                    </div>
                                )}

                                {selectedMember.sharedData.vitals && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Sleep</span>
                                        <span className="font-medium">{selectedMember.details.sleep}</span>
                                    </div>
                                )}

                                {!selectedMember.sharedData.vitals && !selectedMember.sharedData.activity && !selectedMember.sharedData.mood && (
                                    <p className="text-sm text-muted-foreground italic">No additional data shared.</p>
                                )}
                            </div>

                            <div className="h-px bg-border" />

                            <div className="rounded-md bg-secondary/50 p-2 text-xs text-muted-foreground">
                                <p>Data sharing is controlled by {selectedMember.name}.</p>
                            </div>

                            <button
                                onClick={() => setSelectedMember(null)}
                                className="w-full rounded-md bg-secondary py-2 text-sm font-medium hover:bg-secondary/80"
                            >
                                Close
                            </button>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="flex-1 flex items-center justify-center p-6 text-center text-muted-foreground border-dashed">
                        <p>Select a family member to view details.</p>
                    </Card>
                )}
            </div>
        </div>
    )
}
