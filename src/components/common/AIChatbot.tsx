import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sparkles,
    X,
    Send,
    Bot,
    User,
    Loader2,
    ChevronDown,
    Settings2,
    Cpu
} from "lucide-react";
import { chatWithAI, AIProvider } from "@/lib/ai-service";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export const AIChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Welcome to PixelPerfect. I am your AI Concierge. How may I assist your curation today?" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [provider, setProvider] = useState<AIProvider>("gemini");
    const [showSettings, setShowSettings] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await chatWithAI(provider, [...messages, { role: "user", content: userMessage }] as any);
            setMessages(prev => [...prev, { role: "assistant", content: response }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: "assistant", content: "I apologize, but I encountered a disruption in my processing. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-28 right-8 z-[100] flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: "bottom right" }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-[400px] h-[600px] bg-white rounded-[32px] shadow-premium border border-slate-100 flex flex-col overflow-hidden mb-6"
                    >
                        {/* Header */}
                        <div className="p-6 bg-slate-950 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30">
                                    <Sparkles className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-widest leading-tight">AI Concierge</h3>
                                    <div className="flex items-center gap-1.5 pt-0.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Online • {provider}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowSettings(!showSettings)}
                                    className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                                >
                                    <Settings2 className="w-4 h-4 text-slate-400" />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                                >
                                    <X className="w-4 h-4 text-slate-400" />
                                </button>
                            </div>
                        </div>

                        {/* Provider Settings */}
                        <AnimatePresence>
                            {showSettings && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="bg-slate-900 border-b border-white/5 overflow-hidden"
                                >
                                    <div className="p-4 grid grid-cols-2 gap-2">
                                        {(["gemini", "openai", "grok", "openrouter"] as AIProvider[]).map((p) => (
                                            <button
                                                key={p}
                                                onClick={() => {
                                                    setProvider(p);
                                                    setShowSettings(false);
                                                }}
                                                className={cn(
                                                    "px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                                    provider === p
                                                        ? "bg-primary text-white border-primary shadow-gold"
                                                        : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"
                                                )}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Messages Area */}
                        <ScrollArea className="flex-1 p-6" viewportRef={scrollRef}>
                            <div className="space-y-6">
                                {messages.map((m, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={cn(
                                            "flex gap-3",
                                            m.role === "user" ? "flex-row-reverse" : ""
                                        )}
                                    >
                                        <div className={cn(
                                            "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border",
                                            m.role === "assistant"
                                                ? "bg-primary/10 border-primary/20 text-primary"
                                                : "bg-slate-100 border-slate-200 text-slate-400"
                                        )}>
                                            {m.role === "assistant" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                        </div>
                                        <div className={cn(
                                            "max-w-[80%] p-4 rounded-3xl text-sm leading-relaxed",
                                            m.role === "assistant"
                                                ? "bg-slate-50 text-slate-700 rounded-tl-none border border-slate-100"
                                                : "bg-primary text-white rounded-tr-none shadow-premium font-medium"
                                        )}>
                                            {m.content}
                                        </div>
                                    </motion.div>
                                ))}
                                {isLoading && (
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-3xl rounded-tl-none border border-slate-100">
                                            <div className="flex gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-200 animate-bounce" />
                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-200 animate-bounce [animation-delay:0.2s]" />
                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-200 animate-bounce [animation-delay:0.4s]" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>

                        {/* Input Area */}
                        <div className="p-6 bg-slate-50 border-t border-slate-100">
                            <div className="relative group">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                    placeholder="Inquire with the concierge..."
                                    className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-4 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isLoading}
                                    className="absolute right-2 top-2 w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-primary transition-all disabled:opacity-50 disabled:bg-slate-200"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-center text-[9px] text-slate-400 pt-3 font-bold uppercase tracking-widest">
                                Powered by Chainkit AI • Premium Assistance
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-16 h-16 rounded-[24px] flex items-center justify-center shadow-premium transition-all duration-500",
                    isOpen ? "bg-slate-900 rotate-90" : "bg-primary shadow-gold"
                )}
            >
                {isOpen ? (
                    <X className="w-7 h-7 text-white" />
                ) : (
                    <div className="relative">
                        <Bot className="w-7 h-7 text-white" />
                        <motion.div
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full border-2 border-primary"
                        />
                    </div>
                )}
            </motion.button>
        </div>
    );
};
