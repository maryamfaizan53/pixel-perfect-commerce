import { supabase } from "@/integrations/supabase/client";

export type AIProvider = "gemini" | "openai" | "grok" | "openrouter";

interface ChatMessage {
    role: "user" | "assistant" | "system";
    content: string;
}

const BACKEND_URL = import.meta.env.VITE_CHATBOT_BACKEND_URL || "http://localhost:8000";

/**
 * Get the current user's access token for authenticated API calls
 */
const getAccessToken = async (): Promise<string | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
};

/**
 * Core function to handle chat requests via the Python backend.
 * Now requires authentication - sends Supabase JWT token.
 */
export const chatWithAI = async (
    provider: AIProvider,
    messages: ChatMessage[],
    useRAG = true
): Promise<string> => {
    try {
        // Get authentication token
        const token = await getAccessToken();
        if (!token) {
            return "Please sign in to use the AI concierge.";
        }

        const response = await fetch(`${BACKEND_URL}/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
                messages,
                provider,
                use_rag: useRAG
            }),
        });

        if (response.status === 401) {
            return "Your session has expired. Please sign in again.";
        }
        
        if (response.status === 429) {
            return "You've reached the rate limit. Please try again later.";
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail?.message || errorData.detail || "Backend request failed");
        }

        const data = await response.json();
        return data.response;
    } catch (error: any) {
        console.error("Chatbot Backend Error:", error);
        return `The concierge is currently unavailable. ${error.message}`;
    }
};
