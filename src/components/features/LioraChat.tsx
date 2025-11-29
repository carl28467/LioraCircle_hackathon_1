import { useState } from "react"
import { chatApi } from "@/api/client"
import { MessageCircle, X, Send, Bot, Paperclip, Mic, Maximize2, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"

export function LioraChat() {
    const { session } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const [isMaximized, setIsMaximized] = useState(false)
    const [messages, setMessages] = useState([
        { id: 1, role: "assistant", content: "Hello! I'm Liora. How can I help you with your family's health today?" }
    ])
    const [inputValue, setInputValue] = useState("")

    const [isLoading, setIsLoading] = useState(false)

    const handleSend = async () => {
        if (!inputValue.trim() || isLoading) return

        const newMessage = { id: Date.now(), role: "user", content: inputValue }
        setMessages(prev => [...prev, newMessage])
        setInputValue("")
        setIsLoading(true)

        try {
            const data = await chatApi.sendMessage(inputValue, 'user-1', {}, session?.access_token)
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: "assistant",
                content: data.response
            }])
        } catch (error) {
            console.error("Failed to send message:", error)
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: "assistant",
                content: "I'm sorry, I'm having trouble connecting to my brain right now. Please try again later."
            }])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className={cn(
            "fixed z-50 flex flex-col items-end gap-4 transition-all duration-300",
            isMaximized ? "bottom-0 right-0 h-full w-full p-4" : "bottom-6 right-6"
        )}>
            {isOpen && (
                <Card className={cn(
                    "flex flex-col shadow-xl animate-in slide-in-from-bottom-10 fade-in duration-300",
                    "bg-white border border-gray-200", // Force white background and gray border
                    isMaximized ? "h-full w-full" : "h-[500px] w-[380px]"
                )}>
                    <CardHeader className="flex flex-row items-center justify-between border-b p-4">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                                <Bot className="h-5 w-5 text-blue-600" />
                            </div>
                            <CardTitle className="text-base text-gray-900">Liora</CardTitle>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-500 hover:text-gray-900"
                                onClick={() => setIsMaximized(!isMaximized)}
                            >
                                {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-500 hover:text-gray-900"
                                onClick={() => {
                                    setIsOpen(false)
                                    setIsMaximized(false)
                                }}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={cn(
                                    "flex w-max max-w-[80%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                                    msg.role === "user"
                                        ? "ml-auto bg-blue-600 text-white"
                                        : "bg-gray-100 text-gray-900"
                                )}
                            >
                                {msg.content}
                            </div>
                        ))}
                    </CardContent>
                    <CardFooter className="border-t p-4 bg-white">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                handleSend()
                            }}
                            className="flex w-full items-center gap-2"
                        >
                            <Button type="button" variant="ghost" size="icon" className="shrink-0 text-gray-500 hover:text-gray-900">
                                <Paperclip className="h-4 w-4" />
                            </Button>
                            <Input
                                placeholder="Type a message..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="flex-1 bg-white text-gray-900 border-gray-200 placeholder:text-gray-400"
                            />
                            <Button type="button" variant="ghost" size="icon" className="shrink-0 text-gray-500 hover:text-gray-900">
                                <Mic className="h-4 w-4" />
                            </Button>
                            <Button type="submit" size="icon" disabled={!inputValue.trim()} className="bg-blue-600 text-white hover:bg-blue-700">
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </CardFooter>
                </Card>
            )}

            {!isOpen && (
                <Button
                    size="icon"
                    className="h-14 w-14 rounded-full shadow-lg transition-transform hover:scale-105"
                    onClick={() => setIsOpen(true)}
                >
                    <MessageCircle className="h-7 w-7" />
                    <span className="sr-only">Open Liora Chat</span>
                </Button>
            )}
        </div>
    )
}
