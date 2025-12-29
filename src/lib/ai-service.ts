import { supabase } from "@/integrations/supabase/client";

export type AIProvider = "gemini" | "openai" | "grok" | "openrouter";

interface ChatMessage {
    role: "user" | "assistant" | "system";
    content: string;
}

const BACKEND_URL = import.meta.env.VITE_CHATBOT_BACKEND_URL || "http://localhost:8000";

/**
 * Core function to handle chat requests via the Python backend.
 */
export const chatWithAI = async (
    provider: AIProvider,
    messages: ChatMessage[],
    useRAG = true
): Promise<string> => {
    try {
        const response = await fetch(`${BACKEND_URL}/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messages,
                provider,
                use_rag: useRAG
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail?.message || "Backend request failed");
        }

        const data = await response.json();
        return data.response;
    } catch (error: any) {
        console.error("Chatbot Backend Error:", error);
        return `The concierge is currently unavailable. ${error.message}`;
    }
};
