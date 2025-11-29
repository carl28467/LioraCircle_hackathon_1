import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { InventoryItem } from "@/components/features/InventoryItem"
import type { InventoryItemProps } from "@/components/features/InventoryItem"
import { ChefHat, TrendingUp, AlertTriangle } from "lucide-react"
import { LioraInsights } from "@/components/features/LioraInsights"
import { api } from "@/lib/api"
import { supabase } from "@/lib/supabase"
import { AddItemDialog } from "@/components/features/AddItemDialog"

export default function Kitchen() {
    const [activeTab, setActiveTab] = useState<"fridge" | "pantry" | "freezer">("fridge")
    const [inventory, setInventory] = useState<InventoryItemProps[]>([])
    const [loading, setLoading] = useState(true)
    const [userId, setUserId] = useState<string | null>(null)

    useEffect(() => {
        const fetchUserAndInventory = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    setUserId(user.id)
                    loadInventory(user.id)
                }
            } catch (error) {
                console.error("Error fetching user:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchUserAndInventory()
    }, [])

    const loadInventory = async (uid: string) => {
        try {
            const data = await api.kitchen.getInventory(uid)
            // Map API response to component props
            const mappedData = data.map((item: any) => ({
                id: item.id,
                name: item.name,
                category: item.category,
                quantity: item.quantity,
                expiryDate: item.expiry_date, // Map snake_case to camelCase
                status: item.status,
                onDelete: () => handleDelete(item.id) // This will be overridden in render but good for type safety
            }))
            setInventory(mappedData)
        } catch (error) {
            console.error("Error loading inventory:", error)
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await api.kitchen.deleteItem(id)
            setInventory(inventory.filter(item => item.id !== id))
        } catch (error) {
            console.error("Error deleting item:", error)
        }
    }

    const handleAdd = async (itemData: any) => {
        if (!userId) return

        const newItem = {
            user_id: userId,
            ...itemData
        }
        try {
            const addedItem = await api.kitchen.addItem(newItem)
            const mappedItem: InventoryItemProps = {
                id: addedItem.id,
                name: addedItem.name,
                category: addedItem.category,
                quantity: addedItem.quantity,
                expiryDate: addedItem.expiry_date,
                status: addedItem.status,
                onDelete: () => handleDelete(addedItem.id)
            }
            setInventory([...inventory, mappedItem])
        } catch (error) {
            console.error("Error adding item:", error)
            throw error // Re-throw to let dialog know it failed
        }
    }

    const filteredInventory = inventory.filter(item => item.category === activeTab)

    // Calculate Stats
    const totalItems = inventory.length
    const expiringItems = inventory.filter(item => item.status === "expiring").length
    const stockLevel = Math.min(100, Math.round((totalItems / 20) * 100)) // Assuming 20 items is "full" for demo
    const freshnessScore = totalItems > 0 ? Math.round(((totalItems - expiringItems) / totalItems) * 100) : 100

    return (
        <div className="flex h-[calc(100vh-4rem)] flex-col gap-4 p-4 md:flex-row">
            {/* Main Inventory Area */}
            <div className="flex-1 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Smart Kitchen</h2>
                        <p className="text-muted-foreground">Manage your nutrition and inventory.</p>
                    </div>
                    <AddItemDialog onAdd={handleAdd} defaultCategory={activeTab} />
                </div>

                {/* Custom Tabs */}
                <div className="flex gap-2 border-b border-border pb-2">
                    {["fridge", "pantry", "freezer"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Inventory List */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                    {loading ? (
                        <div className="flex h-40 items-center justify-center text-muted-foreground">
                            <p>Loading...</p>
                        </div>
                    ) : filteredInventory.length > 0 ? (
                        filteredInventory.map((item) => (
                            <InventoryItem
                                key={item.id}
                                {...item}
                                onDelete={handleDelete}
                            />
                        ))
                    ) : (
                        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
                            <p>No items in {activeTab}.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Side Panel: Insights & Stats */}
            <div className="flex w-full flex-col gap-4 md:w-80">

                {/* Liora Insights Card */}
                <LioraInsights title="Liora's Insights" icon={ChefHat}>
                    <div className="space-y-3">
                        <div className="rounded-lg bg-background/60 p-3 text-sm backdrop-blur-sm border border-primary/10">
                            <p className="font-medium text-foreground">Smoothie Time?</p>
                            <p className="text-muted-foreground mt-1">
                                You have <span className="text-primary font-medium">Spinach</span> and <span className="text-primary font-medium">Almond Milk</span> expiring soon. Perfect for a green smoothie!
                            </p>
                        </div>
                        <div className="rounded-lg bg-background/60 p-3 text-sm backdrop-blur-sm border border-primary/10">
                            <p className="font-medium text-foreground">Protein Check</p>
                            <p className="text-muted-foreground mt-1">
                                Your freezer is stocked with <span className="text-primary font-medium">Chicken Breast</span>. Remember to thaw it for dinner.
                            </p>
                        </div>
                    </div>
                </LioraInsights>

                {/* Inventory Stats */}
                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-green-500" />
                            <CardTitle className="text-base">Inventory Health</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Stock Level</span>
                                <span className="font-medium">{stockLevel}%</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                                <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${stockLevel}%` }} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Freshness Score</span>
                                <span className="font-medium text-yellow-500">{freshnessScore}%</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                                <div className="h-full bg-yellow-500 rounded-full transition-all duration-500" style={{ width: `${freshnessScore}%` }} />
                            </div>
                        </div>

                        <div className="rounded-md bg-secondary p-3 flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />
                            <div className="text-xs text-muted-foreground">
                                <p className="font-medium text-foreground mb-1">Low Stock Alert</p>
                                <p>You are running low on eggs and butter. Added to shopping list.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    )
}
