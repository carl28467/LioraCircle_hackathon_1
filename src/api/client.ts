import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface ChatResponse {
    response: string;
    metadata: Record<string, any>;
}

export const chatApi = {
    sendMessage: async (message: string, userId: string = 'user-1', context: Record<string, any> = {}, token?: string) => {
        const headers: Record<string, string> = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await apiClient.post<ChatResponse>('/chat', {
            message,
            user_id: userId,
            context
        }, { headers });
        return response.data;
    }
};
