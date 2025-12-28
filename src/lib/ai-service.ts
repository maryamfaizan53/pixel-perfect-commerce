import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { supabase } from "@/integrations/supabase/client";

export type AIProvider = "gemini" | "openai" | "grok" | "openrouter";

interface ChatMessage {
    role: "user" | "assistant" | "system";
    content: string;
}

// Configuration for API Keys (Replace with actual env variables or state)
const API_KEYS = {
    gemini: import.meta.env.VITE_GEMINI_API_KEY || "",
    openai: import.meta.env.VITE_OPENAI_API_KEY || "",
    grok: import.meta.env.VITE_GROK_API_KEY || "",
    openrouter: import.meta.env.VITE_OPENROUTER_API_KEY || "",
};

// Initializing Providers
const genAI = API_KEYS.gemini ? new GoogleGenerativeAI(API_KEYS.gemini) : null;
const openai = API_KEYS.openai ? new OpenAI({ apiKey: API_KEYS.openai, dangerouslyAllowBrowser: true }) : null;
const grokClient = API_KEYS.grok ? new OpenAI({
    apiKey: API_KEYS.grok,
    baseURL: "https://api.x.ai/v1",
    dangerouslyAllowBrowser: true
}) : null;
const openrouterClient = API_KEYS.openrouter ? new OpenAI({
    apiKey: API_KEYS.openrouter,
    baseURL: "https://openrouter.ai/api/v1",
    dangerouslyAllowBrowser: true,
    defaultHeaders: {
        "HTTP-Referer": window.location.origin,
        "X-Title": "PixelPerfect Commerce",
    }
}) : null;

/**
 * Generates embeddings for a given text using Gemini.
 * Note: RAG requires text to be converted into vectors.
 */
export const generateEmbedding = async (text: string): Promise<number[]> => {
    if (!genAI) throw new Error("Gemini API Key is missing for embeddings generation.");
    const model = genAI.getGenerativeModel({ model: "embedding-001" });
    const result = await model.embedContent(text);
    return result.embedding.values;
};

/**
 * Retrieves relevant context documents from Supabase Vector store.
 */
export const retrieveContext = async (query: string, matchThreshold = 0.5, matchCount = 3) => {
    try {
        const embedding = await generateEmbedding(query);
        const { data, error } = await supabase.rpc('match_documents', {
            query_embedding: embedding,
            match_threshold: matchThreshold,
            match_count: matchCount,
        });

        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error("RAG Retrieval Error:", err);
        return [];
    }
};

/**
 * Core function to handle chat requests across different providers.
 */
export const chatWithAI = async (
    provider: AIProvider,
    messages: ChatMessage[],
    useRAG = true
): Promise<string> => {
    let context = "";

    if (useRAG) {
        const lastMessage = messages[messages.length - 1]?.content || "";
        const relevantDocs = await retrieveContext(lastMessage);
        context = relevantDocs.map((doc: any) => doc.content).join("\n---\n");
    }

    const systemMessage = `You are the PixelPerfect AI Concierge, a specialized luxury boutique assistant.
Use the following context to help answer the user's query if relevant. 
If the context doesn't contain the answer, use your general knowledge but maintain the luxury tone.

CONTEXT:
${context || "No specific context retrieved."}

Always be helpful, professional, and sophisticated.`;

    const fullMessages = [
        { role: "system", content: systemMessage },
        ...messages
    ];

    try {
        switch (provider) {
            case "gemini":
                if (!genAI) throw new Error("Gemini provider not configured.");
                const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const result = await geminiModel.generateContent(
                    fullMessages.map(m => `${m.role}: ${m.content}`).join("\n")
                );
                return result.response.text();

            case "openai":
                if (!openai) throw new Error("OpenAI provider not configured.");
                const aiResponse = await openai.chat.completions.create({
                    model: "gpt-4o",
                    messages: fullMessages as any,
                });
                return aiResponse.choices[0].message.content || "No response received.";

            case "grok":
                if (!grokClient) throw new Error("Grok provider not configured.");
                const grokResponse = await grokClient.chat.completions.create({
                    model: "grok-beta",
                    messages: fullMessages as any,
                });
                return grokResponse.choices[0].message.content || "No response received.";

            case "openrouter":
                if (!openrouterClient) throw new Error("OpenRouter provider not configured.");
                const orResponse = await openrouterClient.chat.completions.create({
                    model: "meta-llama/llama-3.1-405b",
                    messages: fullMessages as any,
                });
                return orResponse.choices[0].message.content || "No response received.";

            default:
                throw new Error("Invalid provider.");
        }
    } catch (error: any) {
        console.error(`AI Error (${provider}):`, error);
        return `The concierge is currently unavailable via ${provider}. ${error.message}`;
    }
};
