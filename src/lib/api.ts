const API_BASE_URL = "http://localhost:8000";

export const api = {
    kitchen: {
        getInventory: async (userId: string) => {
            const response = await fetch(`${API_BASE_URL}/kitchen/inventory/${userId}`);
            if (!response.ok) throw new Error("Failed to fetch inventory");
            return response.json();
        },
        addItem: async (item: any) => {
            const response = await fetch(`${API_BASE_URL}/kitchen/inventory`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(item),
            });
            if (!response.ok) throw new Error("Failed to add item");
            return response.json();
        },
        deleteItem: async (itemId: string) => {
            const response = await fetch(`${API_BASE_URL}/kitchen/inventory/${itemId}`, {
                method: "DELETE",
            });
            if (!response.ok) throw new Error("Failed to delete item");
            return response.json();
        },
        updateItem: async (itemId: string, item: any) => {
            const response = await fetch(`${API_BASE_URL}/kitchen/inventory/${itemId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(item),
            });
            if (!response.ok) throw new Error("Failed to update item");
            return response.json();
        }
    }
};
